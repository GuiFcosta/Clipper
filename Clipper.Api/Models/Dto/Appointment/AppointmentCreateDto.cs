using Clipper.Api.Models.Enums;

namespace Clipper.Api.Models.Dto.Appointment;

public class AppointmentCreateDto
{
    public string AppointmentTime { get; set; } = string.Empty;
    public string AppointmentDate  { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public int BarberId { get; set; }
    public int BarberShopId { get; set; }
    public int ServiceId { get; set; }
    public string? Notes { get; set; }
}