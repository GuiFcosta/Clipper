using Clipper.Api.Common;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class ReviewRepository(ApplicationDbContext context) : IReviewRepository
{
    public async Task<Review?> GetByAppointmentIdAsync(int appointmentId)
    {
        return await context.Reviews
            .IgnoreQueryFilters()
            .Include(r => r.Customer)
            .Include(r => r.Barber)
            .FirstOrDefaultAsync(r => r.AppointmentId == appointmentId);
    }

    public async Task<PagedResult<Review>> GetPagedByBarberShopAsync(int barberShopId, int page, int pageSize)
    {
        var query = context.Reviews
            .IgnoreQueryFilters()
            .Include(r => r.Customer)
            .Include(r => r.Barber)
            .Where(r => r.BarberShopId == barberShopId);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return PagedResult<Review>.Create(items, page, pageSize, totalCount);
    }

    public async Task<PagedResult<Review>> GetPagedByBarberAsync(int barberId, int page, int pageSize)
    {
        var query = context.Reviews
            .IgnoreQueryFilters()
            .Include(r => r.Customer)
            .Include(r => r.Barber)
            .Where(r => r.BarberId == barberId);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return PagedResult<Review>.Create(items, page, pageSize, totalCount);
    }

    public async Task<(double AverageRating, int TotalReviews)> GetBarberShopRatingStatsAsync(int barberShopId)
    {
        var query = context.Reviews
            .IgnoreQueryFilters()
            .Where(r => r.BarberShopId == barberShopId);

        var count = await query.CountAsync();
        if (count == 0)
            return (0, 0);

        var avg = await query.AverageAsync(r => (double)r.Rating);
        return (Math.Round(avg, 2), count);
    }

    public async Task<(double AverageRating, int TotalReviews)> GetBarberRatingStatsAsync(int barberId)
    {
        var query = context.Reviews
            .IgnoreQueryFilters()
            .Where(r => r.BarberId == barberId);

        var count = await query.CountAsync();
        if (count == 0)
            return (0, 0);

        var avg = await query.AverageAsync(r => (double)r.Rating);
        return (Math.Round(avg, 2), count);
    }

    public async Task<Review> CreateAsync(Review review)
    {
        context.Reviews.Add(review);
        await context.SaveChangesAsync();
        return review;
    }
}
