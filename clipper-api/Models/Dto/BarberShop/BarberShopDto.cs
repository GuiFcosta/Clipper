namespace Clipper.Api.Models.Dto.BarberShopDto;

public class BarberShopDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
    public ICollection<int>? BarbersIds { get; set; } = new List<int>();
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}