using Clipper.Api.Common;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IServiceRepository
{
    Task<PagedResult<Service>> GetPagedServices(int page, int pageSize, int? barberShopId = null, bool? isActive = null, string? search = null);
    Task<IEnumerable<Service>> GetAllServices(int? barberShopId = null);
    Task<Service?> GetServiceById(int id);
    Task<Service> CreateService(Service service);
    Task UpdateService(Service service);
    Task DeleteService(int id);
}
