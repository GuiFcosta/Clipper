using Clipper.Api.Common;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByAppointmentIdAsync(int appointmentId);
    Task<PagedResult<Review>> GetPagedByBarberShopAsync(int barberShopId, int page, int pageSize);
    Task<PagedResult<Review>> GetPagedByBarberAsync(int barberId, int page, int pageSize);
    Task<(double AverageRating, int TotalReviews)> GetBarberShopRatingStatsAsync(int barberShopId);
    Task<(double AverageRating, int TotalReviews)> GetBarberRatingStatsAsync(int barberId);
    Task<Review> CreateAsync(Review review);
}
