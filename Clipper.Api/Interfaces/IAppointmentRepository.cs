using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetByBarberAndDate(int barberId, DateOnly date);
    Task<IEnumerable<Appointment>> GetByCustomer(int customerId);
    Task<Appointment?> GetAppointmentById(int id);
    Task<Appointment> CreateAppointment(Appointment appointment);
    Task UpdateAppointment(Appointment appointment);
    Task DeleteAppointment(Appointment appointment);
}