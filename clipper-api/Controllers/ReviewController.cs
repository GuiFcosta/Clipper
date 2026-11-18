using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Models.Dto.Review;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController(IReviewService reviewService) : ControllerBase
{
    [Authorize(Roles = $"{UserRoles.Customer},{UserRoles.Admin}")]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] ReviewCreateDto dto)
    {
        var result = await reviewService.CreateAsync(dto);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return CreatedAtAction(
            nameof(GetBarberShopReviews),
            new { barberShopId = result.Value.BarberShopId },
            result.Value);
    }

    [AllowAnonymous]
    [HttpGet("barbershop/{barberShopId:int}")]
    public async Task<ActionResult<RatingSummaryDto>> GetBarberShopReviews(
        int barberShopId,
        [FromQuery] PaginationParams pagination)
    {
        var result = await reviewService.GetByBarberShopAsync(barberShopId, pagination.Page, pagination.PageSize);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpGet("barber/{barberId:int}")]
    public async Task<ActionResult<RatingSummaryDto>> GetBarberReviews(
        int barberId,
        [FromQuery] PaginationParams pagination)
    {
        var result = await reviewService.GetByBarberAsync(barberId, pagination.Page, pagination.PageSize);
        if (result.IsFailure)
            return result.ToProblemDetails(this);

        return Ok(result.Value);
    }
}
