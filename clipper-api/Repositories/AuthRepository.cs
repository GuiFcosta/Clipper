using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Clipper.Api.Constants;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Auth;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
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
    private const int AccessTokenExpirationHours = 1;
    private const int RefreshTokenExpirationDays = 7;

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (dto.Role == UserRoles.Barber)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Barbers cannot self-register. A BarberShopOwner or Admin must register barbers via /api/barber."
            };
        }

        if (dto.Role != UserRoles.Customer && dto.Role != UserRoles.BarberShopOwner)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid role. Self-registration is allowed only for 'Customer' or 'BarberShopOwner'."
            };
        }

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
            StateAccount = StateAccount.Active
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

        if (user.StateAccount == StateAccount.Pending)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Your account is pending approval."
            };
        }

        if (user.StateAccount == StateAccount.Suspended)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Your account has been suspended."
            };
        }

        var expiresAtUtc = DateTime.UtcNow.AddHours(AccessTokenExpirationHours);
        var token = await GenerateJwtToken(user, expiresAtUtc);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "Login successful.",
            Token = token,
            RefreshToken = refreshToken.Token,
            ExpiresAtUtc = expiresAtUtc
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshTokenValue)
    {
        if (string.IsNullOrWhiteSpace(refreshTokenValue))
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Refresh token is required."
            };
        }

        var storedToken = await context.RefreshTokens
            .Include(rt => rt.ApplicationUser)
            .FirstOrDefaultAsync(rt => rt.Token == refreshTokenValue);

        if (storedToken == null || !storedToken.IsActive)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid or expired refresh token."
            };
        }

        var user = storedToken.ApplicationUser;
        if (user.StateAccount != StateAccount.Active)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Your account is not active."
            };
        }

        // Rotate refresh token
        var newRefreshToken = GenerateRefreshTokenEntity(user.Id);
        storedToken.RevokedAtUtc = DateTime.UtcNow;
        storedToken.ReplacedByToken = newRefreshToken.Token;

        context.RefreshTokens.Add(newRefreshToken);
        await context.SaveChangesAsync();

        var expiresAtUtc = DateTime.UtcNow.AddHours(AccessTokenExpirationHours);
        var newJwt = await GenerateJwtToken(user, expiresAtUtc);

        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "Token refreshed successfully.",
            Token = newJwt,
            RefreshToken = newRefreshToken.Token,
            ExpiresAtUtc = expiresAtUtc
        };
    }

    public async Task<bool> RevokeTokenAsync(string refreshTokenValue, string? currentUserId, bool isAdmin)
    {
        var storedToken = await context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshTokenValue);

        if (storedToken == null || !storedToken.IsActive)
            return false;

        if (!isAdmin && storedToken.ApplicationUserId != currentUserId)
            return false;

        storedToken.RevokedAtUtc = DateTime.UtcNow;
        await context.SaveChangesAsync();
        return true;
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(string userId)
    {
        var refreshToken = GenerateRefreshTokenEntity(userId);
        context.RefreshTokens.Add(refreshToken);
        await context.SaveChangesAsync();
        return refreshToken;
    }

    private static RefreshToken GenerateRefreshTokenEntity(string userId)
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return new RefreshToken
        {
            Token = Convert.ToBase64String(randomBytes),
            ApplicationUserId = userId,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(RefreshTokenExpirationDays)
        };
    }

    private async Task<string> GenerateJwtToken(ApplicationUser user, DateTime expiresAtUtc)
    {
        var roles = await userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.UserName!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        authClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var (barberShopId, barberId, customerId) = await ResolveUserContextAsync(user);

        if (barberShopId.HasValue)
            authClaims.Add(new Claim("BarberShopId", barberShopId.Value.ToString()));

        if (barberId.HasValue)
            authClaims.Add(new Claim("BarberId", barberId.Value.ToString()));

        if (customerId.HasValue)
            authClaims.Add(new Claim("CustomerId", customerId.Value.ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: authClaims,
            expires: expiresAtUtc,
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
                case UserRoles.Customer:
                    var customer = new Customer
                    {
                        ApplicationUserId = user.Id,
                        Name = user.FullName,
                        PhoneNumber = user.PhoneNumber ?? dto.PhoneNumber,
                        Email = user.Email!
                    };
                    context.Clients.Add(customer);
                    break;

                case UserRoles.BarberShopOwner:
                    var newShop = new BarberShop
                    {
                        Name = !string.IsNullOrWhiteSpace(dto.BarberShopName)
                            ? dto.BarberShopName
                            : $"{user.FullName}'s Barber Shop",
                        Address = !string.IsNullOrWhiteSpace(dto.BarberShopAddress)
                            ? dto.BarberShopAddress
                            : "Edit the address",
                        PhoneNumber = user.PhoneNumber ?? dto.PhoneNumber,
                        Email = user.Email!,
                        Barbers = new List<Barber>()
                    };
                    context.BarberShops.Add(newShop);
                    await context.SaveChangesAsync();

                    user.BarberShopId = newShop.Id;
                    await userManager.UpdateAsync(user);
                    break;
            }

            await context.SaveChangesAsync();
            return true;
        }
        catch (Exception)
        {
            await userManager.DeleteAsync(user);
            return false;
        }
    }

    public async Task<CurrentUserDto?> GetCurrentUserAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
            return null;

        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var (barberShopId, barberId, customerId) = await ResolveUserContextAsync(user);

        return new CurrentUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            Role = roles.FirstOrDefault() ?? string.Empty,
            Roles = roles,
            StateAccount = user.StateAccount.ToString(),
            BarberShopId = barberShopId,
            BarberId = barberId,
            CustomerId = customerId
        };
    }

    private async Task<(int? BarberShopId, int? BarberId, int? CustomerId)> ResolveUserContextAsync(ApplicationUser user)
    {
        var barberShopId = user.BarberShopId;

        var barber = await context.Barbers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.ApplicationUserId == user.Id);

        int? barberId = barber?.Id;
        if (!barberShopId.HasValue && barber?.BarberShopId != null)
            barberShopId = barber.BarberShopId;

        var customer = await context.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ApplicationUserId == user.Id);

        return (barberShopId, barberId, customer?.Id);
    }
}
