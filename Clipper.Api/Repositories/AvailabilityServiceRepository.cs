using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
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
        return await context.Appointments
            .Where(a => a.BarberId == barberId && a.StartTime == date.ToDateTime(new TimeOnly()))
            .ToListAsync();
    }

    public async Task<IEnumerable<TimeBlock>> GetBarberTimeBlocksAsync(int barberId, DateOnly date)
    {
        return await context.TimeBlocks
            .Where(a => a.BarberId == barberId 
                        && a.StartDateTime <= date.ToDateTime(new TimeOnly()) 
                        && a.EndDateTime >= date.ToDateTime(new TimeOnly()))
            .ToListAsync();
    }
}