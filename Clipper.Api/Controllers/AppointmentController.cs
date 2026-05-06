using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Appointment;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController(
    IAppointmentRepository repository,
    AvailabilityService serviceRepository) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentDto>> GetAppointmentById(int id)
    {
        var appointment = await repository.GetAppointmentById(id);
        if (appointment == null)
            return NotFound();
        return Ok(appointment.ToDto());
    }
    
    [HttpGet("barber/{barberId}")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByBarberAndDate(int barberId, DateOnly date)
    {
        var appointments = await repository.GetByBarberAndDate(barberId, date);
        return Ok(appointments.ToDtos());
    }
    
    [HttpGet("barber/today/{barberId}")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetTodayAppointmentsByBarber(int barberId)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var appointments = await repository.GetByBarberAndDate(barberId, today);
        
        return Ok(appointments.ToDtos());
    }
    
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByCustomer(int customerId)
    {
        var appointments = await repository.GetByCustomer(customerId);
        return Ok(appointments.ToDtos());
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] AppointmentCreateDto appointment)
    {
        // Validate the appointment details
        var service = await repository.GetServiceById(appointment.ServiceId);
        if (service == null)
            return BadRequest("Service not found.");
        var serviceDuration = TimeSpan.FromMinutes(service.Duration);

        var dateTimeResult = DateTime.ParseExact(appointment.AppointmentDate + " " + appointment.AppointmentTime,
            "yyyy-MM-dd HH:mm", System.Globalization.CultureInfo.InvariantCulture);
        
        // Check if the appointment time is available
        var date = DateOnly.FromDateTime(dateTimeResult);
        var availableSlots = await serviceRepository.GetAvailableTimeSlots(appointment.BarberId, date, serviceDuration);
        if (!availableSlots.Contains(dateTimeResult.TimeOfDay))
        {
            return BadRequest("Sorry, this time slot is no longer available. Please choose another one.");
        }
        
        // Create the appointment
        var newAppointment = new Appointment
        {
            CustomerId = appointment.CustomerId,
            BarberId = appointment.BarberId,
            BarberShopId =  appointment.BarberShopId,
            ServiceId = appointment.ServiceId,
            StartTime = dateTimeResult,
            Status = AppointmentStatus.Pending,
            Notes =  appointment.Notes
        };
        var createdAppointment = await repository.CreateAppointment(newAppointment);
        return CreatedAtAction(nameof(GetAppointmentById), new { id = createdAppointment.Id }, createdAppointment.ToDto());
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var appointment = await repository.GetAppointmentById(id);
        if (appointment == null) 
            return NotFound();

        if (appointment.Status == AppointmentStatus.Completed)
            return BadRequest("Cannot cancel a completed appointment.");

        appointment.Status = AppointmentStatus.Cancelled;
        await repository.UpdateAppointment(appointment);

        return Ok("Appointment canceled successfully.");
    }
}