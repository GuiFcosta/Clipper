using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    [Required]
    public string Address { get; set; } = null!;
    
    // Not required, as a barber might not be assigned to a barber shop yet
    public int? BarberShopId { get; set; }
    public BarberShop? BarberShop { get; set; }
    
    // Barber's schedule
    public BarberSchedule? BarberSchedule { get; set; }
    
    // List of time blocks for the barber
    public ICollection<TimeBlock>? TimeBlocks { get; set; } = new List<TimeBlock>();
    
    // List of appointments for the barber
    public ICollection<Appointment>? Appointments { get; set; } = new List<Appointment>();
}