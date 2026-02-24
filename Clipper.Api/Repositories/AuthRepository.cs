using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Clipper.Api.Constants;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Auth;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Clipper.Api.Repositories;

public class AuthRepository(
    UserManager<ApplicationUser> userManager,
    IConfiguration configuration,
    RoleManager<IdentityRole> roleManager,
    ApplicationDbContext context) : IAuthRepository
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (dto.Role != UserRoles.Barber && dto.Role != UserRoles.Customer && dto.Role != UserRoles.BarberShopOwner)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid role. Role must be either 'Barber', 'Customer', or 'BarberShopOwner'."
            };
        }

        // Validação de campos obrigatórios por role
        if (dto.Role == UserRoles.Barber)
        {
            if (string.IsNullOrWhiteSpace(dto.Nif))
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Nif is required for Barber role."
                };
            }

            if (string.IsNullOrWhiteSpace(dto.Address))
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Address is required for Barber role."
                };
            }

            if (!dto.BarberShopId.HasValue)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "BarberShopId is required for Barber role. The barber must be assigned to a BarberShop."
                };
            }

            // Validar se a BarberShop existe
            var barberShopExists = await context.BarberShops.AnyAsync(bs => bs.Id == dto.BarberShopId.Value);
            if (!barberShopExists)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"BarberShop with Id {dto.BarberShopId.Value} does not exist."
                };
            }
        }

        // Validação de PhoneNumber
        if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Phone number is required."
            };
        }

        var user = new ApplicationUser
        {
            FullName = dto.FullName,
            UserName = dto.Email,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            BarberShopId = dto.BarberShopId
        };
        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = string.Join("; ", result.Errors.Select(e => e.Description))
            };
        }

        // Garante que a role existe antes de atribuir
        if (!await roleManager.RoleExistsAsync(dto.Role))
        {
            await roleManager.CreateAsync(new IdentityRole(dto.Role));
        }

        await userManager.AddToRoleAsync(user, dto.Role);

        if (await AddUserToSpecificTableAsync(user, dto))
        {
            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "User registered successfully."
            };
        }

        return new AuthResponseDto
        {
            IsSuccess = false,
            Message = "An error occurred while saving user details. Please try again."
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, loginDto.Password))
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid email or password."
            };
        }

        var token = await GenerateJwtToken(user);
        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "Login successful.",
            Token = token
        };
    }

    private async Task<string> GenerateJwtToken(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // foreach (var role in roles)
        // {
        //     authClaims.Add(new Claim(ClaimTypes.Role, role));
        // }

        authClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role))); // LINQ 

        if (user.BarberShopId.HasValue)
            authClaims.Add(new Claim("BarberShopId", user.BarberShopId.Value.ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: authClaims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials,
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"]
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<bool> AddUserToSpecificTableAsync(ApplicationUser user, RegisterDto dto)
    {
        try
        {
            switch (dto.Role)
            {
                case UserRoles.Barber:
                    var barber = new Barber
                    {
                        ApplicationUserId = user.Id,
                        Name = user.FullName,
                        PhoneNumber = user.PhoneNumber ?? dto.PhoneNumber,
                        Email = user.Email!,
                        Nif = dto.Nif!,
                        Address = dto.Address!,
                        BarberShopId = dto.BarberShopId!.Value
                    };
                    context.Barbers.Add(barber);
                    break;
                    
                case UserRoles.Customer:
                    var customer = new Customer
                    {
                        ApplicationUserId = user.Id,
                        Name = user.FullName,
                        PhoneNumber = user.PhoneNumber ?? dto.PhoneNumber,
                        Email = user.Email!
                        // ApplicationUser = user
                    };
                    context.Clients.Add(customer);
                    break;
                    
                case UserRoles.BarberShopOwner:
                    var newShop = new BarberShop
                    {
                        Name = dto.BarberShopName ?? $"{user.FullName}'s Barber Shop",
                        Address = dto.BarberShopAddress ?? "Edit the address",
                        PhoneNumber = "Edit the phone number",
                        Email = "Edit the email",
                        Barbers = new List<Barber>()
                    };
                    context.BarberShops.Add(newShop);
                    await context.SaveChangesAsync(); // Save to generate the Id for the new shop

                    user.BarberShopId = newShop.Id;
                    await userManager.UpdateAsync(user);
                    break;
            }

            await context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            await userManager.DeleteAsync(user);
            Console.WriteLine($"Error registering user: {ex.Message}");
            return false;
        }
    }
}