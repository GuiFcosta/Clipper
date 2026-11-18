namespace Clipper.Api.Models.Dto.Auth;

public class CurrentUserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public IReadOnlyList<string> Roles { get; set; } = [];
    public string StateAccount { get; set; } = string.Empty;
    public int? BarberShopId { get; set; }
    public int? BarberId { get; set; }
    public int? CustomerId { get; set; }
}
