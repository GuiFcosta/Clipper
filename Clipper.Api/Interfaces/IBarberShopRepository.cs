using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IBarberShopRepository
{
    // CRUD Operations for BarberShop
    Task<IEnumerable<BarberShop>> GetAllBarberShops();
    Task<BarberShop?> GetBarberShopById(int id);
    Task CreateBarberShop(BarberShop barberShop);
    Task UpdateBarberShop(BarberShop barberShop);
    Task DeleteBarberShop(int id);
}