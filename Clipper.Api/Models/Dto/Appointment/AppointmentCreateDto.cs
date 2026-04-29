using Clipper.Api.Models.Enums;

namespace Clipper.Api.Models.Dto.Appointment;

public class AppointmentCreateDto
{
    public DateTime StartTime { get; set; }
    public int CustomerId { get; set; }
    public int BarberId { get; set; }
    public int BarberShopId { get; set; }
    public int ServiceId { get; set; }
    public string? Notes { get; set; }
}