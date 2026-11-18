using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.TimeBlock;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
public class TimeBlockController(ITimeBlockService timeBlockService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("barber/{barberId:int}")]
    public async Task<ActionResult<IEnumerable<TimeBlockDto>>> GetBarberTimeBlocks(
        int barberId,
        [FromQuery] DateTime? fromUtc = null,
        [FromQuery] DateTime? toUtc = null)
    {
        var result = await timeBlockService.GetByBarberAsync(barberId, fromUtc, toUtc);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<TimeBlockDto>> CreateTimeBlock([FromBody] TimeBlockCreateDto dto)
    {
        var result = await timeBlockService.CreateAsync(dto);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return CreatedAtAction(nameof(GetBarberTimeBlocks), new { barberId = result.Value.BarberId }, result.Value);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTimeBlock(int id)
    {
        var result = await timeBlockService.DeleteAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }
}
