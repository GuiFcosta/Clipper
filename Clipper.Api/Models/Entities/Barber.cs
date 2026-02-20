using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clipper.Api.Models.Entities;

public class Barber
{
    [Key]
    public int Id { get; set; }
    [Required, StringLength(50)]
    public string Name { get; set; } = null!;
    [Required, StringLength(12)]
    public string PhoneNumber { get; set; } = null!;
    [Required, StringLength(50)]
    public string Email { get; set; } = null!;
    [Required, StringLength(9)]
    public string Nif { get; set; } = null!;
    [Required, StringLength(100)]
    public string Address { get; set; } = null!;
    
    // Link to the ApplicationUser for authentication and authorization
    [StringLength(450)]
    public string ApplicationUserId { get; set; } = string.Empty;
    public ApplicationUser ApplicationUser { get; set; } = null!;
    
    // Not required, as a barber might not be assigned to a barber shop yet
    public int? BarberShopId { get; set; }
    public BarberShop? BarberShop { get; set; }
    
    // Barber's schedule
    public ICollection<BarberSchedule>? BarberSchedule { get; set; } = new  List<BarberSchedule>();
    
    // List of time blocks for the barber
    public ICollection<TimeBlock>? TimeBlocks { get; set; } = new List<TimeBlock>();
    
    // List of appointments for the barber
    public ICollection<Appointment>? Appointments { get; set; } = new List<Appointment>();
}