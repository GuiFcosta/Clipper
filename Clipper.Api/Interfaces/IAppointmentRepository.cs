using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IAppointmentRepository
{
    Task<Appointment?> GetAppointmentById(int id);
    Task<IEnumerable<Appointment>> GetByBarberAndDate(int barberId, DateOnly date);
    Task<IEnumerable<Appointment>> GetByCustomer(int customerId);
    Task<Service?> GetServiceById(int serviceId);
    Task<Appointment> CreateAppointment(Appointment appointment);
    Task UpdateAppointment(Appointment appointment);
}