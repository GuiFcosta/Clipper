using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Entities;

public class Appointment
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public DateTime AppointmentDate { get; set; }
    
    [Required]
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;
    
    [Required]
    public int BarberShopId { get; set; }
    public BarberShop BarberShop { get; set; } = null!;
    
    [Required]
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public string? Notes { get; set; }
}