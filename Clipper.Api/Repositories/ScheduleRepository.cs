using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class ScheduleRepository(ApplicationDbContext context) : IScheduleRepository
{
    public async Task<IEnumerable<BarberSchedule>> GetBarberSchedule(int barberId)
    {
        return await context.BarberSchedules
            .IgnoreQueryFilters()
            .Where(s => s.BarberId == barberId)
            .OrderBy(s => s.DayOfWeek)
            .ToListAsync();
    }

    public async Task<BarberSchedule?> GetScheduleByDay(int barberId, DayOfWeek dayOfWeek)
    {
        return await context.BarberSchedules
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.BarberId == barberId && s.DayOfWeek == dayOfWeek);
    }

    public async Task<BarberSchedule> CreateSchedule(BarberSchedule schedule)
    {
        context.BarberSchedules.Add(schedule);
        await context.SaveChangesAsync();
        return schedule;
    }

    public async Task UpdateSchedule(BarberSchedule schedule)
    {
        context.BarberSchedules.Update(schedule);
        await context.SaveChangesAsync();
    }

    public async Task DeleteSchedule(int barberId, int dayOfWeek)
    {
        var schedules = await context.BarberSchedules
            .IgnoreQueryFilters()
            .Where(s => s.BarberId == barberId && (int)s.DayOfWeek == dayOfWeek)
            .ToListAsync();

        if (schedules.Count > 0)
        {
            context.BarberSchedules.RemoveRange(schedules);
            await context.SaveChangesAsync();
        }
    }
}
