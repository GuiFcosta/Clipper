using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class BarberShopRepository(ApplicationDbContext context) : IBarberShopRepository
{
    public async Task<IEnumerable<BarberShop>> GetAllBarberShopsAsync()
    {
        return await context.BarberShops
            .Include(bs => bs.Barbers)
            .ToListAsync();
        
    }

    public async Task<BarberShop?> GetBarberShopByIdAsync(int id)
    {
        return await context.BarberShops
            .Include(bs => bs.Barbers)
            .FirstOrDefaultAsync(bs => bs.Id == id);
        
    }
    
    public Task CreateBarberShopAsync(BarberShop barberShop)
    {
        context.BarberShops.Add(barberShop);
        return context.SaveChangesAsync();
    }
    
    public async Task UpdateBarberShopAsync(BarberShop barberShop)
    {
        context.BarberShops.Update(barberShop);
        await context.SaveChangesAsync();
    }
    
    public async Task DeleteBarberShopAsync(int id)
    {
        var barberShop = await context.BarberShops.FindAsync(id);
        if (barberShop == null)
            return;
        
        context.BarberShops.Remove(barberShop);
        await context.SaveChangesAsync();
    }
}