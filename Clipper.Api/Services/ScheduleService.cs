using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Barber;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Services;

public interface IScheduleService
{
    Task<Result<IEnumerable<ScheduleDto>>> GetByBarberAsync(int barberId);
    Task<Result<ScheduleDto>> UpsertScheduleAsync(ScheduleDto dto);
    Task<Result> DeleteScheduleAsync(int barberId, int dayOfWeek);
}

public class ScheduleService(
    IScheduleRepository scheduleRepository,
    IBarberRepository barberRepository,
    ICurrentUserService currentUserService) : IScheduleService
{
    public async Task<Result<IEnumerable<ScheduleDto>>> GetByBarberAsync(int barberId)
    {
        var barber = await barberRepository.GetBarberById(barberId);
        if (barber == null)
            return Result.Failure<IEnumerable<ScheduleDto>>(Error.NotFound("Barber.NotFound", $"Barber with ID {barberId} was not found."));

        var schedules = await scheduleRepository.GetBarberSchedule(barberId);
        return Result.Success(schedules.Select(ToDto));
    }

    public async Task<Result<ScheduleDto>> UpsertScheduleAsync(ScheduleDto dto)
    {
        var barber = await barberRepository.GetBarberById(dto.BarberId);
        if (barber == null)
            return Result.Failure<ScheduleDto>(Error.NotFound("Barber.NotFound", $"Barber with ID {dto.BarberId} was not found."));

        if (!CanManageBarber(barber))
            return Result.Failure<ScheduleDto>(Error.Forbidden("Schedule.Forbidden", "You are not authorized to manage this barber's schedule."));

        if (!TimeSpan.TryParse(dto.StartTime, out var startTime) ||
            !TimeSpan.TryParse(dto.EndTime, out var endTime) ||
            !TimeSpan.TryParse(dto.LunchBreakStartTime, out var lunchStart) ||
            !TimeSpan.TryParse(dto.LunchBreakEndTime, out var lunchEnd))
        {
            return Result.Failure<ScheduleDto>(Error.Validation("Schedule.InvalidTime", "Invalid time format. Use HH:mm."));
        }

        if (startTime >= endTime)
            return Result.Failure<ScheduleDto>(Error.Validation("Schedule.InvalidRange", "StartTime must be earlier than EndTime."));

        if (lunchStart > lunchEnd)
            return Result.Failure<ScheduleDto>(Error.Validation("Schedule.InvalidLunchBreak", "LunchBreakStartTime cannot be after LunchBreakEndTime."));

        var existing = await scheduleRepository.GetScheduleByDay(dto.BarberId, dto.DayOfWeek);
        if (existing != null)
        {
            existing.StartTime = startTime;
            existing.LunchBreakStartTime = lunchStart;
            existing.LunchBreakEndTime = lunchEnd;
            existing.EndTime = endTime;
            await scheduleRepository.UpdateSchedule(existing);
            return Result.Success(ToDto(existing));
        }

        var barberSchedule = new BarberSchedule
        {
            BarberId = dto.BarberId,
            DayOfWeek = dto.DayOfWeek,
            StartTime = startTime,
            LunchBreakStartTime = lunchStart,
            LunchBreakEndTime = lunchEnd,
            EndTime = endTime
        };

        var created = await scheduleRepository.CreateSchedule(barberSchedule);
        return Result.Success(ToDto(created));
    }

    public async Task<Result> DeleteScheduleAsync(int barberId, int dayOfWeek)
    {
        var barber = await barberRepository.GetBarberById(barberId);
        if (barber == null)
            return Result.Failure(Error.NotFound("Barber.NotFound", $"Barber with ID {barberId} was not found."));

        if (!CanManageBarber(barber))
            return Result.Failure(Error.Forbidden("Schedule.Forbidden", "You are not authorized to manage this barber's schedule."));

        await scheduleRepository.DeleteSchedule(barberId, dayOfWeek);
        return Result.Success();
    }

    private bool CanManageBarber(Barber barber) =>
        currentUserService.IsAdmin() ||
        (currentUserService.IsInRole(UserRoles.BarberShopOwner) && currentUserService.GetBarberShopId() == barber.BarberShopId) ||
        (currentUserService.IsInRole(UserRoles.Barber) && currentUserService.GetBarberId() == barber.Id);

    private static ScheduleDto ToDto(BarberSchedule s) => new()
    {
        BarberId = s.BarberId,
        DayOfWeek = s.DayOfWeek,
        StartTime = s.StartTime.ToString(@"hh\:mm"),
        LunchBreakStartTime = s.LunchBreakStartTime.ToString(@"hh\:mm"),
        LunchBreakEndTime = s.LunchBreakEndTime.ToString(@"hh\:mm"),
        EndTime = s.EndTime.ToString(@"hh\:mm")
    };
}
