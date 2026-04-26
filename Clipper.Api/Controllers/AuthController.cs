using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthRepository repository) : ControllerBase
{
    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var userToRegister = await repository.RegisterAsync(registerDto);
        if (!userToRegister.IsSuccess)
            return BadRequest(userToRegister);
        return Ok(userToRegister);
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginDto loginDto)
    {
        var userToLogin = await repository.LoginAsync(loginDto);
        if (!userToLogin.IsSuccess)            
            return Unauthorized(userToLogin);
        return Ok(userToLogin);
    }
}