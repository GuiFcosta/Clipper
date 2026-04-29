using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class ScheduleRepository(ApplicationDbContext context) : IScheduleRepository
{
    public async Task<BarberSchedule?> GetBarberSchedule(int id)
    {
        return await context.BarberSchedules
            .Include(s => s.Barber)
            .FirstOrDefaultAsync(s => s.BarberId == id);
    }
    public async Task<BarberSchedule> CreateSchedule(BarberSchedule schedule)
    {
        context.BarberSchedules.Add(schedule);
        await context.SaveChangesAsync();
        return schedule;
    }
}