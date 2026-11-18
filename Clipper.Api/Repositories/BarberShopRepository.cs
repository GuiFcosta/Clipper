using Clipper.Api.Common;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.BarberShopDto;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class BarberShopRepository(ApplicationDbContext context) : IBarberShopRepository
{
    public async Task<PagedResult<BarberShop>> GetPagedBarberShops(int page, int pageSize, string? search = null)
    {
        var query = context.BarberShops
            .Include(bs => bs.Barbers)
            .Include(bs => bs.Reviews)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(bs =>
                bs.Name.ToLower().Contains(term) ||
                bs.Address.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(bs => bs.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return PagedResult<BarberShop>.Create(items, page, pageSize, totalCount);
    }

    public async Task<IEnumerable<BarberShop>> GetAllBarberShops()
    {
        return await context.BarberShops
            .Include(bs => bs.Barbers)
            .Include(bs => bs.Reviews)
            .ToListAsync();
    }

    public async Task<BarberShop?> GetBarberShopById(int id)
    {
        return await context.BarberShops
            .Include(bs => bs.Barbers)
            .Include(bs => bs.Reviews)
            .FirstOrDefaultAsync(bs => bs.Id == id);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await context.BarberShops.AnyAsync(bs => bs.Id == id);
    }

    public async Task<BarberShopDashboardDto> GetDashboardMetricsAsync(int barberShopId, DateOnly? fromDate = null, DateOnly? toDate = null)
    {
        var appointmentsQuery = context.Appointments
            .IgnoreQueryFilters()
            .Include(a => a.Service)
            .Include(a => a.Barber)
            .Where(a => a.BarberShopId == barberShopId);

        if (fromDate.HasValue)
        {
            var fromUtc = fromDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            appointmentsQuery = appointmentsQuery.Where(a => a.StartTime >= fromUtc);
        }

        if (toDate.HasValue)
        {
            var toExclusiveUtc = toDate.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            appointmentsQuery = appointmentsQuery.Where(a => a.StartTime < toExclusiveUtc);
        }

        var appointments = await appointmentsQuery.ToListAsync();
        var reviews = await context.Reviews
            .IgnoreQueryFilters()
            .Where(r => r.BarberShopId == barberShopId)
            .ToListAsync();

        var barbers = await context.Barbers
            .IgnoreQueryFilters()
            .Where(b => b.BarberShopId == barberShopId)
            .ToListAsync();

        var total = appointments.Count;
        var completed = appointments.Count(a => a.Status == AppointmentStatus.Completed);
        var confirmed = appointments.Count(a => a.Status == AppointmentStatus.Confirmed);
        var pending = appointments.Count(a => a.Status == AppointmentStatus.Pending);
        var cancelled = appointments.Count(a => a.Status == AppointmentStatus.Cancelled);

        var cancellationRate = total > 0 ? Math.Round(cancelled * 100.0 / total, 2) : 0;

        var totalRevenue = appointments
            .Where(a => a.Status == AppointmentStatus.Completed)
            .Sum(a => a.Service?.Price ?? 0m);

        var estimatedRevenue = appointments
            .Where(a => a.Status is AppointmentStatus.Completed or AppointmentStatus.Confirmed)
            .Sum(a => a.Service?.Price ?? 0m);

        var avgRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => (double)r.Rating), 2) : 0;

        var barberPerformance = barbers.Select(b =>
        {
            var barberCompleted = appointments
                .Where(a => a.BarberId == b.Id && a.Status == AppointmentStatus.Completed)
                .ToList();
            var barberReviews = reviews.Where(r => r.BarberId == b.Id).ToList();

            return new BarberPerformanceDto
            {
                BarberId = b.Id,
                BarberName = b.Name,
                CompletedAppointments = barberCompleted.Count,
                Revenue = barberCompleted.Sum(a => a.Service?.Price ?? 0m),
                AverageRating = barberReviews.Count > 0 ? Math.Round(barberReviews.Average(r => (double)r.Rating), 2) : 0
            };
        })
        .OrderByDescending(bp => bp.Revenue)
        .ToList();

        var topServices = appointments
            .Where(a => a.Status != AppointmentStatus.Cancelled && a.Service != null)
            .GroupBy(a => new { a.ServiceId, a.Service.Name })
            .Select(g => new TopServiceDto
            {
                ServiceId = g.Key.ServiceId,
                ServiceName = g.Key.Name,
                BookingsCount = g.Count(),
                Revenue = g.Where(a => a.Status == AppointmentStatus.Completed).Sum(a => a.Service?.Price ?? 0m)
            })
            .OrderByDescending(ts => ts.BookingsCount)
            .ToList();

        return new BarberShopDashboardDto
        {
            BarberShopId = barberShopId,
            FromDate = fromDate,
            ToDate = toDate,
            TotalAppointments = total,
            CompletedAppointments = completed,
            ConfirmedAppointments = confirmed,
            PendingAppointments = pending,
            CancelledAppointments = cancelled,
            CancellationRatePercentage = cancellationRate,
            TotalRevenue = totalRevenue,
            EstimatedRevenue = estimatedRevenue,
            AverageRating = avgRating,
            TotalReviews = reviews.Count,
            BarberPerformance = barberPerformance,
            TopServices = topServices
        };
    }

    public Task CreateBarberShop(BarberShop barberShop)
    {
        context.BarberShops.Add(barberShop);
        return context.SaveChangesAsync();
    }

    public async Task UpdateBarberShop(BarberShop barberShop)
    {
        context.BarberShops.Update(barberShop);
        await context.SaveChangesAsync();
    }

    public async Task DeleteBarberShop(int id)
    {
        var barberShop = await context.BarberShops.FindAsync(id);
        if (barberShop == null)
            return;

        context.BarberShops.Remove(barberShop);
        await context.SaveChangesAsync();
    }
}
