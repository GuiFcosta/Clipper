using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.Barber;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarberController(IBarberService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BarberDto>>> GetAllBarbers()
    {
        var result = await service.GetAllAsync();
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpGet("shop/{barberShopId:int}")]
    public async Task<ActionResult<IEnumerable<BarberDto>>> GetAllBarbersFromBarberShop(int barberShopId)
    {
        var result = await service.GetByBarberShopAsync(barberShopId);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BarberDto>> GetBarberById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpPost]
    public async Task<ActionResult<BarberDto>> CreateBarber([FromBody] BarberCreateDto barber)
    {
        var result = await service.CreateAsync(barber);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return CreatedAtAction(nameof(GetBarberById), new { id = result.Value.Id }, result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateBarber(int id, [FromBody] BarberDto barber)
    {
        var result = await service.UpdateAsync(id, barber);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteBarber(int id)
    {
        var result = await service.DeleteAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }
}
