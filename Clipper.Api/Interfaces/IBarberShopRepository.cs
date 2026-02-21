using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IBarberShopRepository
{
    // CRUD Operations for BarberShop
    Task<IEnumerable<BarberShop>> GetAllBarberShopsAsync();
    Task<BarberShop?> GetBarberShopByIdAsync(int id);
    Task CreateBarberShopAsync(BarberShop barberShop);
    Task UpdateBarberShopAsync(BarberShop barberShop);
    Task DeleteBarberShopAsync(int id);
}