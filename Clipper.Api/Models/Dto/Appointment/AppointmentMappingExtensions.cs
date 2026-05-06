
namespace Clipper.Api.Models.Dto.Appointment;

/// <summary>
/// Extension methods para mapear Appointment para AppointmentDto
/// </summary>
public static class AppointmentMappingExtensions
{
    /// <summary>
    /// Converte um Appointment para AppointmentDto
    /// </summary>
    public static AppointmentDto ToDto(this Entities.Appointment appointment)
    {
        if (appointment == null)
            throw new ArgumentNullException(nameof(appointment));

        return new AppointmentDto
        {
            Id = appointment.Id,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            Status = appointment.Status,
            Notes = appointment.Notes,

            // Customer info
            CustomerId = appointment.CustomerId,
            CustomerName = appointment.Customer?.Name,
            CustomerEmail = appointment.Customer?.Email,

            // Barber info
            BarberId = appointment.BarberId,
            BarberName = appointment.Barber?.Name,

            // BarberShop info
            BarberShopId = appointment.BarberShopId,
            BarberShopName = appointment.BarberShop?.Name,

            // Service info
            ServiceId = appointment.ServiceId,
            ServiceName = appointment.Service?.Name,
            ServiceDuration = appointment.Service?.Duration ?? 0,
            ServicePrice = appointment.Service?.Price
        };
    }

    /// <summary>
    /// Converte uma coleção de Appointments para AppointmentDtos
    /// </summary>
    public static IEnumerable<AppointmentDto> ToDtos(this IEnumerable<Entities.Appointment> appointments)
    {
        if (appointments == null)
            throw new ArgumentNullException(nameof(appointments));

        return appointments.Select(a => a.ToDto());
    }
}

