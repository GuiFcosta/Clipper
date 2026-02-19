using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthRepository repository) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var userToRegister = await repository.RegisterAsync(registerDto);
        if (!userToRegister.IsSuccess)
            return BadRequest(userToRegister);
        return Ok(userToRegister);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var userToLogin = await repository.LoginAsync(loginDto);
        if (!userToLogin.IsSuccess)            
            return BadRequest(userToLogin);
        return Ok(userToLogin);
    }
}