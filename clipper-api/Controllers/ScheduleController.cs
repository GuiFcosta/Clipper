using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.Barber;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController(IScheduleService scheduleService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("{barberId:int}")]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetBarberSchedule(int barberId)
    {
        var result = await scheduleService.GetByBarberAsync(barberId);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpPost]
    public async Task<ActionResult<ScheduleDto>> CreateOrUpdateSchedule([FromBody] ScheduleDto schedule)
    {
        var result = await scheduleService.UpsertScheduleAsync(schedule);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return CreatedAtAction(nameof(GetBarberSchedule), new { barberId = result.Value.BarberId }, result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpDelete("{barberId:int}/{dayOfWeek:int}")]
    public async Task<ActionResult> DeleteSchedule(int barberId, int dayOfWeek)
    {
        var result = await scheduleService.DeleteScheduleAsync(barberId, dayOfWeek);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }
}
