using Clipper.Api.Models.Dto;

namespace Clipper.Api.Interfaces;

public interface IBarberShop
{
    // CRUD Operations for BarberShop
    Task<IEnumerable<BarberShopDto>> GetAllBarberShopsAsync();
    Task<BarberShopDto?> GetBarberShopByIdAsync(int id);
    Task<BarberShopDto?> CreateBarberShop(BarberShopDto barberShopDto);
    Task<BarberShopDto?> UpdateBarberShop(int id, BarberShopDto barberShopDto);
    Task<bool> DeleteBarberShop(int id);
}