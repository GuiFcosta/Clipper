using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class AppointmentRepository(ApplicationDbContext context) : IAppointmentRepository
{
    public async Task<Appointment?> GetAppointmentById(int id)
    {
        return await context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Barber)
            .Include(a => a.Service)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
    public async Task<IEnumerable<Appointment>> GetByBarberAndDate(int barberId, DateOnly date)
    {
        var startOfDayUtc = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endOfDayUtc = date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        return await context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Barber)
            .Include(a => a.BarberShop)
            .Include(a => a.Service)
            .Where(a => a.BarberId == barberId && a.StartTime >= startOfDayUtc && a.StartTime < endOfDayUtc)
            .OrderBy(a => a.StartTime)
            .ToListAsync();
    }
    public async Task<IEnumerable<Appointment>> GetByCustomer(int customerId)
    {
        return await context.Appointments
            .Include(a => a.Barber)
            .Include(a => a.Service)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.StartTime)
            .ToListAsync();
    }
    public async Task<Service?> GetServiceById(int serviceId)
    {
        return await context.Services.FindAsync(serviceId);
    }
    public async Task<Appointment> CreateAppointment(Appointment appointment)
    {
        context.Appointments.Add(appointment);
        await context.SaveChangesAsync();
        return appointment;
    }
    public async Task UpdateAppointment(Appointment appointment)
    {
        context.Appointments.Update(appointment);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAppointment(Appointment appointment)
    {
        context.Appointments.Remove(appointment);
        await context.SaveChangesAsync();
    }
}