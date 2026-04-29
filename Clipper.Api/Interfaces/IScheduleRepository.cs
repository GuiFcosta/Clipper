using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IScheduleRepository
{
    public Task<BarberSchedule?> GetBarberSchedule(int id);
    public Task<BarberSchedule> CreateSchedule(BarberSchedule schedule);
}