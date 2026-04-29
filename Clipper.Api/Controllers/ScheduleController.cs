using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Barber;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController(IScheduleRepository scheduleRepository) : ControllerBase
{
    [HttpGet("{barberId}")]
    public async Task<ActionResult<ScheduleDto>> GetBarberSchedule(int barberId)
    {
        var barberSchedule = await scheduleRepository.GetBarberSchedule(barberId);
        if (barberSchedule == null)
            return NotFound();
        var barberScheduleDto = new ScheduleDto
        {
            BarberId = barberSchedule.BarberId,
            DayOfWeek = barberSchedule.DayOfWeek,
            StartTime = barberSchedule.StartTime.ToString(@"hh\:mm"),
            LunchBreakStartTime = barberSchedule.LunchBreakStartTime.ToString(@"hh\:mm"),
            LunchBreakEndTime = barberSchedule.LunchBreakEndTime.ToString(@"hh\:mm"),
            EndTime = barberSchedule.EndTime.ToString(@"hh\:mm")
        };
        return Ok(barberScheduleDto);
    }
    [HttpPost]
    public async Task<ActionResult> CreateSchedule([FromBody] ScheduleDto schedule)
    {
        var barberSchedule = new BarberSchedule
        {
            BarberId = schedule.BarberId,
            DayOfWeek = schedule.DayOfWeek,
            StartTime = TimeSpan.Parse(schedule.StartTime),
            LunchBreakStartTime = TimeSpan.Parse(schedule.LunchBreakStartTime),
            LunchBreakEndTime = TimeSpan.Parse(schedule.LunchBreakEndTime),
            EndTime = TimeSpan.Parse(schedule.EndTime)
        };
        var createSchedule = await scheduleRepository.CreateSchedule(barberSchedule);
        return CreatedAtAction(nameof(GetBarberSchedule), new { barberId = createSchedule.BarberId }, createSchedule);
    }
}