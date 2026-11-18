using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Dto.Barber;

public class BarberCreateDto
{
    [Required, StringLength(50, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(50)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Required, StringLength(12)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, StringLength(9)]
    public string Nif { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Address { get; set; } = string.Empty;

    public int? BarberShopId { get; set; }
}
