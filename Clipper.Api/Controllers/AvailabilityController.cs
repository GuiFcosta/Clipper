using Clipper.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController(AvailabilityService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<TimeSpan>> GetAvailableTimeSlots(int barberId, DateOnly date, TimeSpan appointmentDuration)
    {
        var availableSlots = await service.GetAvailableTimeSlots(barberId, date, appointmentDuration);
        return Ok(availableSlots);
    }
}