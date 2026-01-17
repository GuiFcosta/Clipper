using Clipper.Api.Models.Entities;

namespace Clipper.Api.Models.Dto;

public class BarberShopDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
    public ICollection<Barber>? Barbers { get; set; } = new List<Barber>();
}