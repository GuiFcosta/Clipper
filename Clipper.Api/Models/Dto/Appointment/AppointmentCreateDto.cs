using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Dto.Appointment;

public class AppointmentCreateDto
{
    [Required]
    public string AppointmentTime { get; set; } = string.Empty;

    [Required]
    public string AppointmentDate { get; set; } = string.Empty;

    public int? CustomerId { get; set; }

    [Required]
    public int BarberId { get; set; }

    [Required]
    public int BarberShopId { get; set; }

    [Required]
    public int ServiceId { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
