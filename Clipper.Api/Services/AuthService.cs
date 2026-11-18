using Clipper.Api.Common;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Auth;

namespace Clipper.Api.Services;

public interface IAuthService
{
    Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<Result<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task<Result> RevokeTokenAsync(RevokeTokenRequestDto dto);
}

public class AuthService(
    IAuthRepository authRepository,
    ICurrentUserService currentUserService) : IAuthService
{
    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        var response = await authRepository.RegisterAsync(dto);
        if (!response.IsSuccess)
        {
            return Result.Failure<AuthResponseDto>(
                Error.Validation("Auth.RegisterFailed", response.Message));
        }

        return Result.Success(response);
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var response = await authRepository.LoginAsync(dto);
        if (!response.IsSuccess)
        {
            if (response.Message.Contains("pending", StringComparison.OrdinalIgnoreCase) ||
                response.Message.Contains("suspended", StringComparison.OrdinalIgnoreCase))
            {
                return Result.Failure<AuthResponseDto>(
                    Error.Forbidden("Auth.AccountInactive", response.Message));
            }

            return Result.Failure<AuthResponseDto>(
                Error.Unauthorized("Auth.InvalidCredentials", response.Message));
        }

        return Result.Success(response);
    }

    public async Task<Result<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        var response = await authRepository.RefreshTokenAsync(dto.RefreshToken);
        if (!response.IsSuccess)
        {
            return Result.Failure<AuthResponseDto>(
                Error.Unauthorized("Auth.InvalidRefreshToken", response.Message));
        }

        return Result.Success(response);
    }

    public async Task<Result> RevokeTokenAsync(RevokeTokenRequestDto dto)
    {
        var revoked = await authRepository.RevokeTokenAsync(
            dto.RefreshToken,
            currentUserService.GetUserId(),
            currentUserService.IsAdmin());

        if (!revoked)
        {
            return Result.Failure(
                Error.NotFound("Auth.RefreshTokenNotFound", "Active refresh token was not found or cannot be revoked."));
        }

        return Result.Success();
    }
}
