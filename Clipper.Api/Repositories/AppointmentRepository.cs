using Clipper.Api.Common;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class AppointmentRepository(ApplicationDbContext context) : IAppointmentRepository
{
    public async Task<Appointment?> GetAppointmentById(int id)
    {
        return await context.Appointments
            .IgnoreQueryFilters()
            .Include(a => a.Customer)
            .Include(a => a.Barber)
            .Include(a => a.BarberShop)
            .Include(a => a.Service)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<PagedResult<Appointment>> GetPagedAppointments(
        int page,
        int pageSize,
        int? barberShopId = null,
        int? barberId = null,
        int? customerId = null,
        DateOnly? date = null,
        AppointmentStatus? status = null)
    {
        var query = context.Appointments
            .IgnoreQueryFilters()
            .Include(a => a.Customer)
            .Include(a => a.Barber)
            .Include(a => a.BarberShop)
            .Include(a => a.Service)
            .AsQueryable();

        if (barberShopId.HasValue)
            query = query.Where(a => a.BarberShopId == barberShopId.Value);

        if (barberId.HasValue)
            query = query.Where(a => a.BarberId == barberId.Value);

        if (customerId.HasValue)
            query = query.Where(a => a.CustomerId == customerId.Value);

        if (date.HasValue)
        {
            var startOfDayUtc = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var endOfDayUtc = date.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(a => a.StartTime >= startOfDayUtc && a.StartTime < endOfDayUtc);
        }

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return PagedResult<Appointment>.Create(items, page, pageSize, totalCount);
    }

    public async Task<IEnumerable<Appointment>> GetByBarberAndDate(int barberId, DateOnly date)
    {
        var startOfDayUtc = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endOfDayUtc = date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        return await context.Appointments
            .IgnoreQueryFilters()
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
            .IgnoreQueryFilters()
            .Include(a => a.Customer)
            .Include(a => a.Barber)
            .Include(a => a.BarberShop)
            .Include(a => a.Service)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.StartTime)
            .ToListAsync();
    }

    public async Task<Service?> GetServiceById(int serviceId)
    {
        return await context.Services
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == serviceId);
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
}
