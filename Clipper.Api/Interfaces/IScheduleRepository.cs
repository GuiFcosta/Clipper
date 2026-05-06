using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IScheduleRepository
{
    public Task<IEnumerable<BarberSchedule>?> GetBarberSchedule(int id);
    public Task<BarberSchedule> CreateSchedule(BarberSchedule schedule);
    public Task DeleteSchedule(int barberId, int dayOfWeek);
}