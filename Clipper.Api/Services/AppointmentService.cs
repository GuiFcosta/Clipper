using System.Globalization;
using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Appointment;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;

namespace Clipper.Api.Services;

public interface IAppointmentService
{
    Task<Result<AppointmentDto>> GetByIdAsync(int id);
    Task<Result<PagedResult<AppointmentDto>>> GetPagedAsync(
        int page,
        int pageSize,
        int? barberShopId = null,
        int? barberId = null,
        int? customerId = null,
        DateOnly? date = null,
        AppointmentStatus? status = null);
    Task<Result<IEnumerable<AppointmentDto>>> GetByBarberAndDateAsync(int barberId, DateOnly date);
    Task<Result<IEnumerable<AppointmentDto>>> GetByCustomerAsync(int customerId);
    Task<Result<AppointmentDto>> CreateAsync(AppointmentCreateDto dto);
    Task<Result<AppointmentDto>> ConfirmAsync(int id);
    Task<Result<AppointmentDto>> CompleteAsync(int id);
    Task<Result<AppointmentDto>> CancelAsync(int id);
}

public class AppointmentService(
    IAppointmentRepository repository,
    IBarberRepository barberRepository,
    ICustomerRepository customerRepository,
    IAvailabilityService availabilityService,
    ICurrentUserService currentUserService) : IAppointmentService
{
    public async Task<Result<AppointmentDto>> GetByIdAsync(int id)
    {
        var appointment = await repository.GetAppointmentById(id);
        if (appointment == null)
            return Result.Failure<AppointmentDto>(Error.NotFound("Appointment.NotFound", $"Appointment with ID {id} was not found."));

        if (!CanViewAppointment(appointment))
            return Result.Failure<AppointmentDto>(Error.Forbidden("Appointment.Forbidden", "You do not have permission to view this appointment."));

        return Result.Success(appointment.ToDto());
    }

    public async Task<Result<PagedResult<AppointmentDto>>> GetPagedAsync(
        int page,
        int pageSize,
        int? barberShopId = null,
        int? barberId = null,
        int? customerId = null,
        DateOnly? date = null,
        AppointmentStatus? status = null)
    {
        if (currentUserService.IsInRole(UserRoles.Customer))
        {
            customerId = currentUserService.GetCustomerId();
            if (!customerId.HasValue)
                return Result.Failure<PagedResult<AppointmentDto>>(Error.Forbidden("Appointment.Forbidden", "Customer profile not found for current user."));
        }
        else if (currentUserService.IsInRole(UserRoles.Barber) || currentUserService.IsInRole(UserRoles.BarberShopOwner))
        {
            barberShopId = currentUserService.GetBarberShopId();
        }

        var paged = await repository.GetPagedAppointments(page, pageSize, barberShopId, barberId, customerId, date, status);
        var dtos = paged.Items.Select(a => a.ToDto()).ToList();
        return Result.Success(PagedResult<AppointmentDto>.Create(dtos, paged.Page, paged.PageSize, paged.TotalCount));
    }

    public async Task<Result<IEnumerable<AppointmentDto>>> GetByBarberAndDateAsync(int barberId, DateOnly date)
    {
        var barber = await barberRepository.GetBarberById(barberId);
        if (barber == null)
            return Result.Failure<IEnumerable<AppointmentDto>>(Error.NotFound("Barber.NotFound", $"Barber with ID {barberId} was not found."));

        if (!currentUserService.IsAdmin() && currentUserService.GetBarberShopId() != barber.BarberShopId)
            return Result.Failure<IEnumerable<AppointmentDto>>(Error.Forbidden("Appointment.Forbidden", "You can only view appointments for barbers in your own BarberShop."));

        var appointments = await repository.GetByBarberAndDate(barberId, date);
        return Result.Success(appointments.ToDtos());
    }

    public async Task<Result<IEnumerable<AppointmentDto>>> GetByCustomerAsync(int customerId)
    {
        if (currentUserService.IsInRole(UserRoles.Customer) && currentUserService.GetCustomerId() != customerId)
            return Result.Failure<IEnumerable<AppointmentDto>>(Error.Forbidden("Appointment.Forbidden", "Customers can only view their own appointments."));

        var appointments = await repository.GetByCustomer(customerId);
        return Result.Success(appointments.ToDtos());
    }

    public async Task<Result<AppointmentDto>> CreateAsync(AppointmentCreateDto dto)
    {
        var resolvedCustomerId = currentUserService.IsInRole(UserRoles.Customer)
            ? currentUserService.GetCustomerId()
            : dto.CustomerId ?? currentUserService.GetCustomerId();

        if (!resolvedCustomerId.HasValue)
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.CustomerRequired", "A valid CustomerId is required."));

        var customer = await customerRepository.GetCustomerById(resolvedCustomerId.Value);
        if (customer == null)
            return Result.Failure<AppointmentDto>(Error.NotFound("Customer.NotFound", $"Customer with ID {resolvedCustomerId.Value} was not found."));

        var barber = await barberRepository.GetBarberById(dto.BarberId);
        if (barber == null)
            return Result.Failure<AppointmentDto>(Error.NotFound("Barber.NotFound", $"Barber with ID {dto.BarberId} was not found."));

        if (barber.BarberShopId != dto.BarberShopId)
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.BarberShopMismatch", "The selected barber does not belong to the specified BarberShop."));

        var service = await repository.GetServiceById(dto.ServiceId);
        if (service == null || !service.IsActive)
            return Result.Failure<AppointmentDto>(Error.NotFound("Service.NotFound", $"Active service with ID {dto.ServiceId} was not found."));

        if (service.BarberShopId != dto.BarberShopId)
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.ServiceShopMismatch", "The selected service does not belong to the specified BarberShop."));

        if (!DateTime.TryParseExact(
                $"{dto.AppointmentDate} {dto.AppointmentTime}",
                "yyyy-MM-dd HH:mm",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var parsedDateTime))
        {
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.InvalidDateTime", "Invalid date or time format. Expected 'yyyy-MM-dd' and 'HH:mm'."));
        }

        var startTimeUtc = DateTime.SpecifyKind(parsedDateTime, DateTimeKind.Utc);
        var date = DateOnly.FromDateTime(startTimeUtc);
        var serviceDuration = TimeSpan.FromMinutes(service.Duration);

        var availableSlots = await availabilityService.GetAvailableTimeSlots(dto.BarberId, date, serviceDuration);
        if (!availableSlots.Contains(startTimeUtc.TimeOfDay))
        {
            return Result.Failure<AppointmentDto>(Error.Conflict(
                "Appointment.SlotUnavailable",
                "Sorry, this time slot is no longer available. Please choose another one."));
        }

        var newAppointment = new Appointment
        {
            CustomerId = resolvedCustomerId.Value,
            BarberId = dto.BarberId,
            BarberShopId = dto.BarberShopId,
            ServiceId = dto.ServiceId,
            StartTime = startTimeUtc,
            Status = AppointmentStatus.Pending,
            Notes = dto.Notes
        };

        var created = await repository.CreateAppointment(newAppointment);
        var reloaded = await repository.GetAppointmentById(created.Id) ?? created;
        return Result.Success(reloaded.ToDto());
    }

    public async Task<Result<AppointmentDto>> ConfirmAsync(int id)
    {
        var appointment = await repository.GetAppointmentById(id);
        if (appointment == null)
            return Result.Failure<AppointmentDto>(Error.NotFound("Appointment.NotFound", $"Appointment with ID {id} was not found."));

        if (!CanManageShopAppointment(appointment))
            return Result.Failure<AppointmentDto>(Error.Forbidden("Appointment.Forbidden", "Only the assigned Barber, BarberShopOwner, or Admin can confirm this appointment."));

        if (appointment.Status != AppointmentStatus.Pending)
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.InvalidStatusTransition", $"Only Pending appointments can be confirmed (current status: {appointment.Status})."));

        appointment.Status = AppointmentStatus.Confirmed;
        await repository.UpdateAppointment(appointment);
        return Result.Success(appointment.ToDto());
    }

    public async Task<Result<AppointmentDto>> CompleteAsync(int id)
    {
        var appointment = await repository.GetAppointmentById(id);
        if (appointment == null)
            return Result.Failure<AppointmentDto>(Error.NotFound("Appointment.NotFound", $"Appointment with ID {id} was not found."));

        if (!CanManageShopAppointment(appointment))
            return Result.Failure<AppointmentDto>(Error.Forbidden("Appointment.Forbidden", "Only the assigned Barber, BarberShopOwner, or Admin can complete this appointment."));

        if (appointment.Status != AppointmentStatus.Confirmed)
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.InvalidStatusTransition", $"Only Confirmed appointments can be marked as Completed (current status: {appointment.Status})."));

        appointment.Status = AppointmentStatus.Completed;
        await repository.UpdateAppointment(appointment);
        return Result.Success(appointment.ToDto());
    }

    public async Task<Result<AppointmentDto>> CancelAsync(int id)
    {
        var appointment = await repository.GetAppointmentById(id);
        if (appointment == null)
            return Result.Failure<AppointmentDto>(Error.NotFound("Appointment.NotFound", $"Appointment with ID {id} was not found."));

        if (!CanViewAppointment(appointment))
            return Result.Failure<AppointmentDto>(Error.Forbidden("Appointment.Forbidden", "You are not authorized to cancel this appointment."));

        if (appointment.Status == AppointmentStatus.Completed)
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.CannotCancelCompleted", "Cannot cancel a completed appointment."));

        if (appointment.Status == AppointmentStatus.Cancelled)
            return Result.Failure<AppointmentDto>(Error.Validation("Appointment.AlreadyCancelled", "Appointment is already cancelled."));

        appointment.Status = AppointmentStatus.Cancelled;
        await repository.UpdateAppointment(appointment);
        return Result.Success(appointment.ToDto());
    }

    private bool CanViewAppointment(Appointment appointment) =>
        currentUserService.IsAdmin() ||
        (currentUserService.IsInRole(UserRoles.Customer) && currentUserService.GetCustomerId() == appointment.CustomerId) ||
        CanManageShopAppointment(appointment);

    private bool CanManageShopAppointment(Appointment appointment) =>
        currentUserService.IsAdmin() ||
        (currentUserService.IsInRole(UserRoles.BarberShopOwner) && currentUserService.GetBarberShopId() == appointment.BarberShopId) ||
        (currentUserService.IsInRole(UserRoles.Barber) && currentUserService.GetBarberId() == appointment.BarberId);
}
