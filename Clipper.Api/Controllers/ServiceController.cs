using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.Service;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceController(IServiceCatalogService serviceCatalog) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PagedResult<ServiceDto>>> GetAllServices(
        [FromQuery] PaginationParams pagination,
        [FromQuery] int? barberShopId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? search = null)
    {
        var result = await serviceCatalog.GetPagedAsync(pagination.Page, pagination.PageSize, barberShopId, isActive, search);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceDto>> GetServiceById(int id)
    {
        var result = await serviceCatalog.GetByIdAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpPost]
    public async Task<ActionResult<ServiceDto>> CreateService([FromBody] ServiceCreateDto dto)
    {
        var result = await serviceCatalog.CreateAsync(dto);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return CreatedAtAction(nameof(GetServiceById), new { id = result.Value.Id }, result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] ServiceDto dto)
    {
        var result = await serviceCatalog.UpdateAsync(id, dto);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner}")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var result = await serviceCatalog.DeleteAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }
}
