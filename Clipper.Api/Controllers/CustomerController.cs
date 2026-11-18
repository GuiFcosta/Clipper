using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.Customer;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomerController(ICustomerService customerService) : ControllerBase
{
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetAllCustomers(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? search = null)
    {
        var result = await customerService.GetPagedAsync(pagination.Page, pagination.PageSize, search);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDto>> GetCustomerById(int id)
    {
        var result = await customerService.GetByIdAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpGet("email/{email}")]
    public async Task<ActionResult<CustomerDto>> GetCustomerByEmail(string email)
    {
        var result = await customerService.GetByEmailAsync(email);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpGet("name/{name}")]
    public async Task<ActionResult<CustomerDto>> GetCustomerByName(string name)
    {
        var result = await customerService.GetByNameAsync(name);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerDto customerUpdateDto)
    {
        var result = await customerService.UpdateAsync(id, customerUpdateDto);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var result = await customerService.DeleteAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return NoContent();
    }
}
