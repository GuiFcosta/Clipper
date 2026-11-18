using Clipper.Api.Models.Dto.Auth;

namespace Clipper.Api.Interfaces;

public interface IAuthRepository
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken, string? currentUserId, bool isAdmin);
    Task<CurrentUserDto?> GetCurrentUserAsync(string userId);
}
