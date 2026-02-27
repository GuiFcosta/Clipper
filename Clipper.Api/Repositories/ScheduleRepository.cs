using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Repositories;

public class ScheduleRepository(ApplicationDbContext context) : IScheduleRepository
{
    public async Task<BarberSchedule> CreateSchedule(BarberSchedule schedule)
    {
        context.BarberSchedules.Add(schedule);
        await context.SaveChangesAsync();
        return schedule;
    }
}