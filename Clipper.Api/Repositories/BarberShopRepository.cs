using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class BarberShopRepository(ApplicationDbContext context) : IBarberShop
{
    public async Task<IEnumerable<BarberShop>> GetAllBarberShops()
    {
        return await context.BarberShops
            .Include(bs => bs.Barbers)
            .ToListAsync();
        
    }

    public async Task<BarberShop?> GetBarberShopById(int id)
    {
        return await context.BarberShops
            .Include(bs => bs.Barbers)
            .FirstOrDefaultAsync(bs => bs.Id == id);
        
    }
    
    public Task CreateBarberShop(BarberShop barberShop)
    {
        context.BarberShops.Add(barberShop);
        return context.SaveChangesAsync();
    }
    
    public async Task UpdateBarberShop(BarberShop barberShop)
    {
        context.BarberShops.Update(barberShop);
        await context.SaveChangesAsync();
    }
    
    public async Task DeleteBarberShop(int id)
    {
        var barberShop = await context.BarberShops.FindAsync(id);
        if (barberShop == null)
            return;
        
        context.BarberShops.Remove(barberShop);
        await context.SaveChangesAsync();
    }
}