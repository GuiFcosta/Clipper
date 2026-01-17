using System.ComponentModel.DataAnnotations;
using Clipper.Api.Models.Enums;

namespace Clipper.Api.Models.Entities;

public class Appointment
{
    [Key]
    public int Id { get; set; }
    
    // When is the appointment scheduled for
    [Required]
    public DateTime StartTime { get; set; }

    [Required] 
    public DateTime EndTime => StartTime.AddMinutes(Service?.Duration ?? 0);
    
    // Who is attending
    [Required]
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    // Who is providing the service
    [Required]
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;
    
    // Where is the service being provided
    [Required]
    public int BarberShopId { get; set; }
    public BarberShop BarberShop { get; set; } = null!;
    
    // What service is being provided
    [Required]
    public int ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    
    [Required]
    public AppointmentStatus Status { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
}