using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Service;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Services;

public interface IServiceCatalogService
{
    Task<Result<PagedResult<ServiceDto>>> GetPagedAsync(int page, int pageSize, int? barberShopId = null, bool? isActive = null, string? search = null);
    Task<Result<ServiceDto>> GetByIdAsync(int id);
    Task<Result<ServiceDto>> CreateAsync(ServiceCreateDto dto);
    Task<Result> UpdateAsync(int id, ServiceDto dto);
    Task<Result> DeleteAsync(int id);
}

public class ServiceCatalogService(
    IServiceRepository repository,
    IBarberShopRepository barberShopRepository,
    ICurrentUserService currentUserService) : IServiceCatalogService
{
    public async Task<Result<PagedResult<ServiceDto>>> GetPagedAsync(
        int page,
        int pageSize,
        int? barberShopId = null,
        bool? isActive = null,
        string? search = null)
    {
        var paged = await repository.GetPagedServices(page, pageSize, barberShopId, isActive, search);
        var dtos = paged.Items.Select(ToDto).ToList();
        return Result.Success(PagedResult<ServiceDto>.Create(dtos, paged.Page, paged.PageSize, paged.TotalCount));
    }

    public async Task<Result<ServiceDto>> GetByIdAsync(int id)
    {
        var service = await repository.GetServiceById(id);
        if (service == null)
            return Result.Failure<ServiceDto>(Error.NotFound("Service.NotFound", $"Service with ID {id} was not found."));

        return Result.Success(ToDto(service));
    }

    public async Task<Result<ServiceDto>> CreateAsync(ServiceCreateDto dto)
    {
        var targetShopId = currentUserService.IsAdmin()
            ? dto.BarberShopId
            : currentUserService.GetBarberShopId();

        if (!targetShopId.HasValue)
            return Result.Failure<ServiceDto>(Error.Validation("Service.BarberShopRequired", "BarberShopId is required to create a service."));

        if (!currentUserService.IsAdmin() &&
            (!currentUserService.IsInRole(UserRoles.BarberShopOwner) || currentUserService.GetBarberShopId() != targetShopId.Value))
        {
            return Result.Failure<ServiceDto>(Error.Forbidden("Service.Forbidden", "Only the BarberShopOwner or Admin can create services for this shop."));
        }

        if (!await barberShopRepository.ExistsAsync(targetShopId.Value))
            return Result.Failure<ServiceDto>(Error.NotFound("BarberShop.NotFound", $"BarberShop with ID {targetShopId.Value} was not found."));

        var service = new Service
        {
            Name = dto.Name,
            Duration = dto.Duration,
            Description = dto.Description,
            Price = dto.Price,
            IsActive = dto.IsActive,
            BarberShopId = targetShopId.Value
        };

        await repository.CreateService(service);
        return Result.Success(ToDto(service));
    }

    public async Task<Result> UpdateAsync(int id, ServiceDto dto)
    {
        if (id != dto.Id)
            return Result.Failure(Error.Validation("Service.IdMismatch", "Route ID does not match payload ID."));

        var existing = await repository.GetServiceById(id);
        if (existing == null)
            return Result.Failure(Error.NotFound("Service.NotFound", $"Service with ID {id} was not found."));

        if (!currentUserService.IsAdmin() && currentUserService.GetBarberShopId() != existing.BarberShopId)
            return Result.Failure(Error.Forbidden("Service.Forbidden", "You can only update services belonging to your own BarberShop."));

        existing.Name = dto.Name;
        existing.Duration = dto.Duration;
        existing.Description = dto.Description;
        existing.Price = dto.Price;
        existing.IsActive = dto.IsActive;

        await repository.UpdateService(existing);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var existing = await repository.GetServiceById(id);
        if (existing == null)
            return Result.Failure(Error.NotFound("Service.NotFound", $"Service with ID {id} was not found."));

        if (!currentUserService.IsAdmin() && currentUserService.GetBarberShopId() != existing.BarberShopId)
            return Result.Failure(Error.Forbidden("Service.Forbidden", "You can only delete services belonging to your own BarberShop."));

        await repository.DeleteService(id);
        return Result.Success();
    }

    private static ServiceDto ToDto(Service service) => new()
    {
        Id = service.Id,
        Name = service.Name,
        Duration = service.Duration,
        Description = service.Description,
        Price = service.Price,
        IsActive = service.IsActive,
        BarberShopId = service.BarberShopId
    };
}
