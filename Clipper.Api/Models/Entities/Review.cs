using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Entities;

public class Review
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;

    [Required]
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    [Required]
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;

    [Required]
    public int BarberShopId { get; set; }
    public BarberShop BarberShop { get; set; } = null!;

    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [StringLength(500)]
    public string? Comment { get; set; }

    [Required]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
