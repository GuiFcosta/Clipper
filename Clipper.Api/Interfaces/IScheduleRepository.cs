using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IScheduleRepository
{
    Task<IEnumerable<BarberSchedule>> GetBarberSchedule(int barberId);
    Task<BarberSchedule?> GetScheduleByDay(int barberId, DayOfWeek dayOfWeek);
    Task<BarberSchedule> CreateSchedule(BarberSchedule schedule);
    Task UpdateSchedule(BarberSchedule schedule);
    Task DeleteSchedule(int barberId, int dayOfWeek);
}
