using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Repositories;

public class AvailabilityServiceRepository : IAvailabilityService
{
    public Task<BarberSchedule?> GetBarberScheduleAsync(int barberId, DayOfWeek dayOfWeek)
    {
        throw new NotImplementedException();
    }
    public Task<IEnumerable<Appointment>> GetBarberAppointmentsAsync(int barberId, DateOnly date)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<TimeBlock>> GetBarberTimeBlocksAsync(int barberId, DateOnly date)
    {
        throw new NotImplementedException();
    }
}