using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class ServiceRepository(ApplicationDbContext context) : IServiceRepository
{
    public async Task<IEnumerable<Service>> GetAllServices()
    {
        return await context.Services.ToListAsync();
    }

    public async Task<Service?> GetServiceById(int id)
    { 
        return await context.Services
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