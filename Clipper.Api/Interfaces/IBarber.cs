using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IBarber
{
    Task<IEnumerable<Barber>> GetAllBarbers();
    Task<IEnumerable<Barber>> GetAllBarbersFromBarberShop(int barberShopId);
    Task<Barber?> GetBarberById(int id);
    Task CreateBarber(Barber barber);
    Task UpdateBarber(Barber barber);
    Task DeleteBarber(int id);
}