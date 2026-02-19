using Clipper.Api.Models.Dto.Auth;

namespace Clipper.Api.Interfaces;

public interface IAuthRepository
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
}