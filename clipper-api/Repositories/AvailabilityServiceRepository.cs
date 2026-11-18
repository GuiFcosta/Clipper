using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class AvailabilityServiceRepository(ApplicationDbContext context) : IAvailabilityServiceRepository
{
    public async Task<BarberSchedule?> GetBarberScheduleAsync(int barberId, DayOfWeek dayOfWeek)
    {
        return await context.BarberSchedules
            .FirstOrDefaultAsync(bs => bs.BarberId == barberId && bs.DayOfWeek == dayOfWeek);
    }

    public async Task<IEnumerable<Appointment>> GetBarberAppointmentsAsync(int barberId, DateOnly date)
    {
        var startOfDayUtc = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endOfDayUtc = date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        return await context.Appointments
            .Include(a => a.Service)
            .Where(a => a.BarberId == barberId
                        && a.Status != AppointmentStatus.Cancelled
                        && a.StartTime >= startOfDayUtc
                        && a.StartTime < endOfDayUtc)
            .ToListAsync();
    }

    public async Task<IEnumerable<TimeBlock>> GetBarberTimeBlocksAsync(int barberId, DateOnly date)
    {
        var startOfDayUtc = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endOfDayUtc = date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        return await context.TimeBlocks
            .Where(tb => tb.BarberId == barberId
                         && tb.StartDateTime < endOfDayUtc
                         && tb.EndDateTime > startOfDayUtc)
            .ToListAsync();
    }
}