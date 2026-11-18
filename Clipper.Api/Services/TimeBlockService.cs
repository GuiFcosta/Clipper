using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.TimeBlock;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Services;

public interface ITimeBlockService
{
    Task<Result<IEnumerable<TimeBlockDto>>> GetByBarberAsync(int barberId, DateTime? fromUtc = null, DateTime? toUtc = null);
    Task<Result<TimeBlockDto>> CreateAsync(TimeBlockCreateDto dto);
    Task<Result> DeleteAsync(int id);
}

public class TimeBlockService(
    ITimeBlockRepository timeBlockRepository,
    IBarberRepository barberRepository,
    ICurrentUserService currentUserService) : ITimeBlockService
{
    public async Task<Result<IEnumerable<TimeBlockDto>>> GetByBarberAsync(int barberId, DateTime? fromUtc = null, DateTime? toUtc = null)
    {
        var barber = await barberRepository.GetBarberById(barberId);
        if (barber == null)
            return Result.Failure<IEnumerable<TimeBlockDto>>(Error.NotFound("Barber.NotFound", $"Barber with ID {barberId} was not found."));

        var normalizedFrom = fromUtc.HasValue ? EnsureUtc(fromUtc.Value) : (DateTime?)null;
        var normalizedTo = toUtc.HasValue ? EnsureUtc(toUtc.Value) : (DateTime?)null;

        var blocks = await timeBlockRepository.GetByBarberAsync(barberId, normalizedFrom, normalizedTo);
        return Result.Success(blocks.Select(ToDto));
    }

    public async Task<Result<TimeBlockDto>> CreateAsync(TimeBlockCreateDto dto)
    {
        var barber = await barberRepository.GetBarberById(dto.BarberId);
        if (barber == null)
            return Result.Failure<TimeBlockDto>(Error.NotFound("Barber.NotFound", $"Barber with ID {dto.BarberId} was not found."));

        if (!CanManageBarber(barber))
            return Result.Failure<TimeBlockDto>(Error.Forbidden("TimeBlock.Forbidden", "You are not authorized to create time blocks for this barber."));

        var startUtc = EnsureUtc(dto.StartDateTime);
        var endUtc = EnsureUtc(dto.EndDateTime);

        if (startUtc >= endUtc)
            return Result.Failure<TimeBlockDto>(Error.Validation("TimeBlock.InvalidRange", "StartDateTime must be earlier than EndDateTime."));

        var block = new TimeBlock
        {
            BarberId = dto.BarberId,
            StartDateTime = startUtc,
            EndDateTime = endUtc,
            Reason = dto.Reason
        };

        var created = await timeBlockRepository.CreateAsync(block);
        return Result.Success(ToDto(created));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var existing = await timeBlockRepository.GetByIdAsync(id);
        if (existing == null)
            return Result.Failure(Error.NotFound("TimeBlock.NotFound", $"TimeBlock with ID {id} was not found."));

        if (!CanManageBarber(existing.Barber))
            return Result.Failure(Error.Forbidden("TimeBlock.Forbidden", "You are not authorized to delete this time block."));

        await timeBlockRepository.DeleteAsync(existing);
        return Result.Success();
    }

    private bool CanManageBarber(Barber barber) =>
        currentUserService.IsAdmin() ||
        (currentUserService.IsInRole(UserRoles.BarberShopOwner) && currentUserService.GetBarberShopId() == barber.BarberShopId) ||
        (currentUserService.IsInRole(UserRoles.Barber) && currentUserService.GetBarberId() == barber.Id);

    private static DateTime EnsureUtc(DateTime dt) =>
        dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

    private static TimeBlockDto ToDto(TimeBlock tb) => new()
    {
        Id = tb.Id,
        BarberId = tb.BarberId,
        StartDateTime = tb.StartDateTime,
        EndDateTime = tb.EndDateTime,
        Reason = tb.Reason
    };
}
