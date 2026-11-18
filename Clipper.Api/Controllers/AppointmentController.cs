using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.Appointment;
using Clipper.Api.Models.Enums;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController(IAppointmentService appointmentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AppointmentDto>>> GetAppointments(
        [FromQuery] PaginationParams pagination,
        [FromQuery] int? barberShopId = null,
        [FromQuery] int? barberId = null,
        [FromQuery] int? customerId = null,
        [FromQuery] DateOnly? date = null,
        [FromQuery] AppointmentStatus? status = null)
    {
        var result = await appointmentService.GetPagedAsync(
            pagination.Page,
            pagination.PageSize,
            barberShopId,
            barberId,
            customerId,
            date,
            status);

        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentDto>> GetAppointmentById(int id)
    {
        var result = await appointmentService.GetByIdAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpGet("barber/{barberId:int}")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByBarberAndDate(int barberId, [FromQuery] DateOnly date)
    {
        var result = await appointmentService.GetByBarberAndDateAsync(barberId, date);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpGet("barber/today/{barberId:int}")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetTodayAppointmentsByBarber(int barberId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = await appointmentService.GetByBarberAndDateAsync(barberId, today);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpGet("customer/{customerId:int}")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByCustomer(int customerId)
    {
        var result = await appointmentService.GetByCustomerAsync(customerId);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] AppointmentCreateDto appointment)
    {
        var result = await appointmentService.CreateAsync(appointment);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return CreatedAtAction(nameof(GetAppointmentById), new { id = result.Value.Id }, result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpPatch("{id:int}/confirm")]
    public async Task<ActionResult<AppointmentDto>> ConfirmAppointment(int id)
    {
        var result = await appointmentService.ConfirmAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.BarberShopOwner},{UserRoles.Barber}")]
    [HttpPatch("{id:int}/complete")]
    public async Task<ActionResult<AppointmentDto>> CompleteAppointment(int id)
    {
        var result = await appointmentService.CompleteAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [HttpPatch("{id:int}/cancel")]
    public async Task<ActionResult<AppointmentDto>> CancelAppointment(int id)
    {
        var result = await appointmentService.CancelAsync(id);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }
}
