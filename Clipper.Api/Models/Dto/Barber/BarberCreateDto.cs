namespace Clipper.Api.Models.Dto.Barber;

public class BarberCreateDto
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Nif { get; set; } = null!;
    public string Address { get; set; } = null!;
    public int? BarberShopId { get; set; }
}