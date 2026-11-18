using Clipper.Api.Common;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class ServiceRepository(ApplicationDbContext context) : IServiceRepository
{
    public async Task<PagedResult<Service>> GetPagedServices(
        int page,
        int pageSize,
        int? barberShopId = null,
        bool? isActive = null,
        string? search = null)
    {
        var query = context.Services
            .IgnoreQueryFilters()
            .AsQueryable();

        if (barberShopId.HasValue)
            query = query.Where(s => s.BarberShopId == barberShopId.Value);

        if (isActive.HasValue)
            query = query.Where(s => s.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(term) ||
                s.Description.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return PagedResult<Service>.Create(items, page, pageSize, totalCount);
    }

    public async Task<IEnumerable<Service>> GetAllServices(int? barberShopId = null)
    {
        var query = context.Services.AsQueryable();
        if (barberShopId.HasValue)
            query = query.IgnoreQueryFilters().Where(s => s.BarberShopId == barberShopId.Value);

        return await query.ToListAsync();
    }

    public async Task<Service?> GetServiceById(int id)
    {
        return await context.Services
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Service> CreateService(Service service)
    {
        context.Services.Add(service);
        await context.SaveChangesAsync();
        return service;
    }

    public async Task UpdateService(Service service)
    {
        context.Services.Update(service);
        await context.SaveChangesAsync();
    }

    public async Task DeleteService(int id)
    {
        var service = await context.Services.FindAsync(id);
        if (service == null)
            return;
        context.Services.Remove(service);
        await context.SaveChangesAsync();
    }
}
