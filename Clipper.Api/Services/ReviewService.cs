using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Review;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;

namespace Clipper.Api.Services;

public interface IReviewService
{
    Task<Result<ReviewDto>> CreateAsync(ReviewCreateDto dto);
    Task<Result<RatingSummaryDto>> GetByBarberShopAsync(int barberShopId, int page, int pageSize);
    Task<Result<RatingSummaryDto>> GetByBarberAsync(int barberId, int page, int pageSize);
}

public class ReviewService(
    IReviewRepository reviewRepository,
    IAppointmentRepository appointmentRepository,
    IBarberShopRepository barberShopRepository,
    IBarberRepository barberRepository,
    ICurrentUserService currentUserService) : IReviewService
{
    public async Task<Result<ReviewDto>> CreateAsync(ReviewCreateDto dto)
    {
        if (dto.Rating is < 1 or > 5)
            return Result.Failure<ReviewDto>(Error.Validation("Review.InvalidRating", "Rating must be between 1 and 5."));

        var appointment = await appointmentRepository.GetAppointmentById(dto.AppointmentId);
        if (appointment == null)
            return Result.Failure<ReviewDto>(Error.NotFound("Appointment.NotFound", $"Appointment with ID {dto.AppointmentId} was not found."));

        if (!currentUserService.IsAdmin() &&
            (!currentUserService.IsInRole(UserRoles.Customer) || currentUserService.GetCustomerId() != appointment.CustomerId))
        {
            return Result.Failure<ReviewDto>(Error.Forbidden("Review.Forbidden", "Only the customer who attended the appointment can submit a review."));
        }

        if (appointment.Status != AppointmentStatus.Completed)
            return Result.Failure<ReviewDto>(Error.Validation("Review.AppointmentNotCompleted", "Only completed appointments can be reviewed."));

        var existingReview = await reviewRepository.GetByAppointmentIdAsync(dto.AppointmentId);
        if (existingReview != null)
            return Result.Failure<ReviewDto>(Error.Conflict("Review.AlreadyExists", "A review has already been submitted for this appointment."));

        var review = new Review
        {
            AppointmentId = appointment.Id,
            CustomerId = appointment.CustomerId,
            BarberId = appointment.BarberId,
            BarberShopId = appointment.BarberShopId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAtUtc = DateTime.UtcNow
        };

        var created = await reviewRepository.CreateAsync(review);
        var reloaded = await reviewRepository.GetByAppointmentIdAsync(created.AppointmentId) ?? created;
        reloaded.Customer ??= appointment.Customer;
        reloaded.Barber ??= appointment.Barber;

        return Result.Success(ToDto(reloaded));
    }

    public async Task<Result<RatingSummaryDto>> GetByBarberShopAsync(int barberShopId, int page, int pageSize)
    {
        if (!await barberShopRepository.ExistsAsync(barberShopId))
            return Result.Failure<RatingSummaryDto>(Error.NotFound("BarberShop.NotFound", $"BarberShop with ID {barberShopId} was not found."));

        var (avg, total) = await reviewRepository.GetBarberShopRatingStatsAsync(barberShopId);
        var paged = await reviewRepository.GetPagedByBarberShopAsync(barberShopId, page, pageSize);
        var dtos = paged.Items.Select(ToDto).ToList();

        return Result.Success(new RatingSummaryDto
        {
            AverageRating = avg,
            TotalReviews = total,
            Reviews = PagedResult<ReviewDto>.Create(dtos, paged.Page, paged.PageSize, paged.TotalCount)
        });
    }

    public async Task<Result<RatingSummaryDto>> GetByBarberAsync(int barberId, int page, int pageSize)
    {
        var barber = await barberRepository.GetBarberById(barberId);
        if (barber == null)
            return Result.Failure<RatingSummaryDto>(Error.NotFound("Barber.NotFound", $"Barber with ID {barberId} was not found."));

        var (avg, total) = await reviewRepository.GetBarberRatingStatsAsync(barberId);
        var paged = await reviewRepository.GetPagedByBarberAsync(barberId, page, pageSize);
        var dtos = paged.Items.Select(ToDto).ToList();

        return Result.Success(new RatingSummaryDto
        {
            AverageRating = avg,
            TotalReviews = total,
            Reviews = PagedResult<ReviewDto>.Create(dtos, paged.Page, paged.PageSize, paged.TotalCount)
        });
    }

    private static ReviewDto ToDto(Review r) => new()
    {
        Id = r.Id,
        AppointmentId = r.AppointmentId,
        CustomerId = r.CustomerId,
        CustomerName = r.Customer?.Name,
        BarberId = r.BarberId,
        BarberName = r.Barber?.Name,
        BarberShopId = r.BarberShopId,
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAtUtc = r.CreatedAtUtc
    };
}
