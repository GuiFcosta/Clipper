using Clipper.Api.Common;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.BarberShopDto;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Services;

public interface IBarberShopService
{
    Task<Result<PagedResult<BarberShopDto>>> GetPagedAsync(int page, int pageSize, string? search = null);
    Task<Result<BarberShopDto>> GetByIdAsync(int id);
    Task<Result<BarberShopDashboardDto>> GetDashboardAsync(int id, DateOnly? fromDate = null, DateOnly? toDate = null);
    Task<Result<BarberShopDto>> CreateAsync(BsCreateDto dto);
    Task<Result> UpdateAsync(int id, BarberShopDto dto);
    Task<Result> DeleteAsync(int id);
}

public class BarberShopService(
    IBarberShopRepository repository,
    ICurrentUserService currentUserService) : IBarberShopService
{
    public async Task<Result<PagedResult<BarberShopDto>>> GetPagedAsync(int page, int pageSize, string? search = null)
    {
        var paged = await repository.GetPagedBarberShops(page, pageSize, search);
        var dtoItems = paged.Items.Select(ToDto).ToList();
        return Result.Success(PagedResult<BarberShopDto>.Create(dtoItems, paged.Page, paged.PageSize, paged.TotalCount));
    }

    public async Task<Result<BarberShopDto>> GetByIdAsync(int id)
    {
        var barberShop = await repository.GetBarberShopById(id);
        if (barberShop == null)
            return Result.Failure<BarberShopDto>(Error.NotFound("BarberShop.NotFound", $"BarberShop with ID {id} was not found."));

        return Result.Success(ToDto(barberShop));
    }

    public async Task<Result<BarberShopDashboardDto>> GetDashboardAsync(int id, DateOnly? fromDate = null, DateOnly? toDate = null)
    {
        if (!currentUserService.IsAdmin() && currentUserService.GetBarberShopId() != id)
            return Result.Failure<BarberShopDashboardDto>(Error.Forbidden("BarberShop.Forbidden", "You can only access the dashboard of your own BarberShop."));

        if (!await repository.ExistsAsync(id))
            return Result.Failure<BarberShopDashboardDto>(Error.NotFound("BarberShop.NotFound", $"BarberShop with ID {id} was not found."));

        if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
            return Result.Failure<BarberShopDashboardDto>(Error.Validation("BarberShop.InvalidDateRange", "fromDate cannot be after toDate."));

        var dashboard = await repository.GetDashboardMetricsAsync(id, fromDate, toDate);
        return Result.Success(dashboard);
    }

    public async Task<Result<BarberShopDto>> CreateAsync(BsCreateDto dto)
    {
        var barberShop = new BarberShop
        {
            Name = dto.Name,
            Address = dto.Address,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email
        };

        await repository.CreateBarberShop(barberShop);
        return Result.Success(ToDto(barberShop));
    }

    public async Task<Result> UpdateAsync(int id, BarberShopDto dto)
    {
        if (id != dto.Id)
            return Result.Failure(Error.Validation("BarberShop.IdMismatch", "Route ID does not match payload ID."));

        if (!currentUserService.IsAdmin() && currentUserService.GetBarberShopId() != id)
            return Result.Failure(Error.Forbidden("BarberShop.Forbidden", "You can only update your own BarberShop."));

        var barberShop = await repository.GetBarberShopById(id);
        if (barberShop == null)
            return Result.Failure(Error.NotFound("BarberShop.NotFound", $"BarberShop with ID {id} was not found."));

        barberShop.Name = dto.Name;
        barberShop.Address = dto.Address;
        barberShop.PhoneNumber = dto.PhoneNumber;
        barberShop.Email = dto.Email;

        await repository.UpdateBarberShop(barberShop);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id)
    {
        if (!currentUserService.IsAdmin())
            return Result.Failure(Error.Forbidden("BarberShop.Forbidden", "Only administrators can delete a BarberShop."));

        var barberShop = await repository.GetBarberShopById(id);
        if (barberShop == null)
            return Result.Failure(Error.NotFound("BarberShop.NotFound", $"BarberShop with ID {id} was not found."));

        await repository.DeleteBarberShop(id);
        return Result.Success();
    }

    private static BarberShopDto ToDto(BarberShop barberShop)
    {
        var reviews = barberShop.Reviews;
        var count = reviews?.Count ?? 0;
        var avg = count > 0 ? Math.Round(reviews!.Average(r => (double)r.Rating), 2) : 0;

        return new BarberShopDto
        {
            Id = barberShop.Id,
            Name = barberShop.Name,
            Address = barberShop.Address,
            PhoneNumber = barberShop.PhoneNumber,
            Email = barberShop.Email,
            BarbersIds = barberShop.Barbers?.Select(b => b.Id).ToList(),
            AverageRating = avg,
            TotalReviews = count
        };
    }
}
