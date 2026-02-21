using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IServiceRepository
{
    // CRUD operations for Service
    Task<IEnumerable<Service>> GetAllServices();
    Task<Service> GetServiceById(int id);
    Task<Service> GetServiceByName(string name);
    Task CreateService(Service service);
    Task UpdateService(Service service);
    Task DeleteService(Service service);
}