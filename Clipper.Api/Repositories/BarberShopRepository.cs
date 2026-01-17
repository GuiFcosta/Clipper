using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto;

namespace Clipper.Api.Repositories;

public class BarberShopRepository : IBarberShop
{
    public Task<IEnumerable<BarberShopDto>> GetAllBarberShopsAsync()
    {
        throw new NotImplementedException();
    }

    public Task<BarberShopDto?> GetBarberShopByIdAsync(int id)
    {
        throw new NotImplementedException();
    }
    
    public Task<BarberShopDto?> CreateBarberShop(BarberShopDto barberShopDto)
    {
        throw new NotImplementedException();
    }
    
    public Task<BarberShopDto?> UpdateBarberShop(int id, BarberShopDto barberShopDto)
    {
        throw new NotImplementedException();
    }
    
    public Task<bool> DeleteBarberShop(int id)
    {
        throw new NotImplementedException();
    }
}