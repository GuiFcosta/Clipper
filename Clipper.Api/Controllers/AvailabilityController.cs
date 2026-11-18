using Clipper.Api.Common;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController(IAvailabilityService availabilityService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimeSpan>>> GetAvailableTimeSlots(
        [FromQuery] int barberId,
        [FromQuery] DateOnly date,
        [FromQuery] int serviceId)
    {
        var result = await availabilityService.GetAvailableSlotsByServiceAsync(barberId, date, serviceId);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }
}
