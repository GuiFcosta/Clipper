using Clipper.Api.Models.Dto;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IBarberShop
{
    // CRUD Operations for BarberShop
    Task<IEnumerable<BarberShop>> GetAllBarberShopsAsync();
    Task<BarberShop?> GetBarberShopByIdAsync(int id);
    Task CreateBarberShop(BarberShop barberShop);
    Task UpdateBarberShop(BarberShop barberShop);
    Task DeleteBarberShop(int id);
}