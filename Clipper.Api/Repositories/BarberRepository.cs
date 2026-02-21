using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class BarberRepository(ApplicationDbContext context) : IBarberRepository
{
    public async Task<IEnumerable<Barber>> GetAllBarbers()
    {
        return await context.Barbers
            .Include(b => b.BarberShop)
            .ToListAsync();
    }
    public async Task<IEnumerable<Barber>> GetAllBarbersFromBarberShop(int barberShopId)
    {
        return await context.Barbers
            .Where(b => b.BarberShopId == barberShopId)
            .Include(b => b.BarberShop)
            .ToListAsync();
    }
    public async Task<Barber?> GetBarberById(int id)
    {
        return await context.Barbers
            .Include(b => b.BarberShop)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public Task CreateBarber(Barber barber)
    {
        context.Barbers.Add(barber);
        return context.SaveChangesAsync();
    }
    public async Task UpdateBarber(Barber barber)
    {
        context.Barbers.Update(barber);
        await context.SaveChangesAsync();
    }

    public async Task DeleteBarber(int id)
    {
        var barber = await context.Barbers.FindAsync(id);
        if (barber == null)
            return;

        context.Barbers.Remove(barber);
        await context.SaveChangesAsync();
    }
}