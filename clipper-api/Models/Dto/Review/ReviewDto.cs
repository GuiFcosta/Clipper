using System.ComponentModel.DataAnnotations;
using Clipper.Api.Common;

namespace Clipper.Api.Models.Dto.Review;

public class ReviewDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int BarberId { get; set; }
    public string? BarberName { get; set; }
    public int BarberShopId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class ReviewCreateDto
{
    [Required]
    public int AppointmentId { get; set; }

    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [StringLength(500)]
    public string? Comment { get; set; }
}

public class RatingSummaryDto
{
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public PagedResult<ReviewDto> Reviews { get; set; } = new();
}
