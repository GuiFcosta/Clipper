using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetByBarberAndDateAsync(int barberId, DateOnly date);
    Task<IEnumerable<Appointment>> GetByCustomerAsync(int customerId);
    Task<Appointment?> GetByIdAsync(int id);
    Task<Service?> GetServiceDetailsAsync(int serviceId); 
    Task<Appointment> CreateAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
}