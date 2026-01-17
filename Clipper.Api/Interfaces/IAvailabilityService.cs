using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IAvailabilityService
{
    // 1. Search for the barber's working hours on THAT day of the week
    Task<BarberSchedule?> GetBarberScheduleAsync(int barberId, DayOfWeek dayOfWeek);

    // 2. Search for appointments for THAT date
    Task<IEnumerable<Appointment>> GetBarberAppointmentsAsync(int barberId, DateOnly date);
    
    // 3. Search for existing time blocks for THAT date
    Task<IEnumerable<TimeBlock>> GetBarberTimeBlocksAsync(int barberId, DateOnly date);
}