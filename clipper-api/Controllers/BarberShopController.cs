using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.BarberShopDto;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarberShopController(IBarberShopService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PagedResult<BarberShopDto>>> GetAllBarberShops(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? search = null)
    {
        var result = await service.GetPagedAsync(pagination.Page, pagination.PageSize, search);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BarberShopDto>> GetBarberShopById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpGet("{id:int}/dashboard")]
    public async Task<ActionResult<BarberShopDashboardDto>> GetBarberShopDashboard(
        int id,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var result = await service.GetDashboardAsync(id, fromDate, toDate);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpPost]
    public async Task<ActionResult<BarberShopDto>> CreateBarberShop([FromBody] BsCreateDto bsCreateDto)
    {
        var result = await service.CreateAsync(bsCreateDto);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return CreatedAtAction(nameof(GetBarberShopById), new { id = result.Value.Id }, result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateBarberShop(int id, [FromBody] BarberShopDto bsUpdateDto)
    {
        var result = await service.UpdateAsync(id, bsUpdateDto);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteBarberShop(int id)
    {
        var result = await service.DeleteAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }
}
