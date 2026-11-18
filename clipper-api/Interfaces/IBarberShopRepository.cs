using Clipper.Api.Common;
using Clipper.Api.Models.Dto.BarberShopDto;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IBarberShopRepository
{
    Task<PagedResult<BarberShop>> GetPagedBarberShops(int page, int pageSize, string? search = null);
    Task<IEnumerable<BarberShop>> GetAllBarberShops();
    Task<BarberShop?> GetBarberShopById(int id);
    Task<bool> ExistsAsync(int id);
    Task<BarberShopDashboardDto> GetDashboardMetricsAsync(int barberShopId, DateOnly? fromDate = null, DateOnly? toDate = null);
    Task CreateBarberShop(BarberShop barberShop);
    Task UpdateBarberShop(BarberShop barberShop);
    Task DeleteBarberShop(int id);
}
