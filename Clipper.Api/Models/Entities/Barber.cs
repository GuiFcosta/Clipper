using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Entities;

public class Barber
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public string PhoneNumber { get; set; } = null!;
    [Required]
    public string Email { get; set; } = null!;
    [Required]
    public string Nif { get; set; } = null!;
    
    // Not required, as a barber might not be assigned to a barber shop yet
    public int? BarberShopId { get; set; }
    public BarberShop? BarberShop { get; set; }
    
    // List of appointments for the barber
    public ICollection<Appointment>? Appointments { get; set; } = new List<Appointment>();
}