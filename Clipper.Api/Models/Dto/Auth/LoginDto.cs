using System.ComponentModel.DataAnnotations;
namespace Clipper.Api.Models.Dto.Auth;

public class LoginDto
{
    [Required(ErrorMessage = "The email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "The password is required.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
}