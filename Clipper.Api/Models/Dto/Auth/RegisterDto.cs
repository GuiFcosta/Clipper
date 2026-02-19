using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Dto.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "The full name is required.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "The name must be at least 3 characters long.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "The email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "The password is required.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "The password must be at least 6 characters long.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "The password confirmation is required.")]
    [Compare(nameof(Password), ErrorMessage = "The password and confirmation do not match.")]
    [DataType(DataType.Password)]
    public string ConfirmPassword { get; set; } = string.Empty;

    // Required only for "Barber", optional for "Customer"
    public string? Nif { get; set; }
    public string? Address { get; set; }

    // Role is required to determine if the user is a "Barber" or "Customer"
    [Required(ErrorMessage = "The role is required.")]
    public string Role { get; set; } = string.Empty;
}