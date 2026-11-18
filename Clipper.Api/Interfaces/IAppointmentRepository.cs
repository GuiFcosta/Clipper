using Clipper.Api.Common;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;

namespace Clipper.Api.Interfaces;

public interface IAppointmentRepository
{
    Task<Appointment?> GetAppointmentById(int id);
    Task<PagedResult<Appointment>> GetPagedAppointments(
        int page,
        int pageSize,
        int? barberShopId = null,
        int? barberId = null,
        int? customerId = null,
        DateOnly? date = null,
        AppointmentStatus? status = null);
    Task<IEnumerable<Appointment>> GetByBarberAndDate(int barberId, DateOnly date);
    Task<IEnumerable<Appointment>> GetByCustomer(int customerId);
    Task<Service?> GetServiceById(int serviceId);
    Task<Appointment> CreateAppointment(Appointment appointment);
    Task UpdateAppointment(Appointment appointment);
}
