using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Auth;
using Clipper.Api.Models.Entities;

using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Clipper.Api.Repositories;

public class AuthRepository(
    UserManager<ApplicationUser> userManager,
    IConfiguration configuration,
    RoleManager<IdentityRole> roleManager) : IAuthRepository
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

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
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
        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "User registered successfully."
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
        var token = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "Login successful.",
            Token = token.Result
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
        authClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

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
}