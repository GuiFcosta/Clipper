using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class ScheduleRepository(ApplicationDbContext context) : IScheduleRepository
{
    public async Task<IEnumerable<BarberSchedule>?> GetBarberSchedule(int id)
    {
        return await context.BarberSchedules.Where(s => s.BarberId == id).ToListAsync();
    }
    public async Task<BarberSchedule> CreateSchedule(BarberSchedule schedule)
    {
        context.BarberSchedules.Add(schedule);
        await context.SaveChangesAsync();
        return schedule;
    }

    public async Task DeleteSchedule(int barberId, int dayOfWeek)
    {
        context.BarberSchedules.RemoveRange(context.BarberSchedules.Where(s => s.BarberId == barberId && (int)s.DayOfWeek == dayOfWeek));
        await context.SaveChangesAsync();
    }
}