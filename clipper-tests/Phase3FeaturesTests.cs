using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Auth;
using Clipper.Api.Models.Dto.BarberShopDto;
using Clipper.Api.Models.Dto.Review;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Clipper.Api.Services;
using FluentAssertions;
using Moq;

namespace Clipper.Tests;

public class Phase3FeaturesTests
{
    private readonly Mock<IAuthRepository> _authRepoMock = new();
    private readonly Mock<IReviewRepository> _reviewRepoMock = new();
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock = new();
    private readonly Mock<IBarberShopRepository> _barberShopRepoMock = new();
    private readonly Mock<IBarberRepository> _barberRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private AuthService CreateAuthService() =>
        new(_authRepoMock.Object, _currentUserMock.Object);

    private ReviewService CreateReviewService() =>
        new(
            _reviewRepoMock.Object,
            _appointmentRepoMock.Object,
            _barberShopRepoMock.Object,
            _barberRepoMock.Object,
            _currentUserMock.Object);

    private BarberShopService CreateBarberShopService() =>
        new(_barberShopRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task RefreshToken_ValidToken_ShouldReturnNewJwtAndRotatedRefreshToken()
    {
        // Arrange
        _authRepoMock.Setup(r => r.RefreshTokenAsync("valid-refresh-token"))
            .ReturnsAsync(new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Token refreshed successfully.",
                Token = "new-jwt-token",
                RefreshToken = "rotated-refresh-token",
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1)
            });

        var sut = CreateAuthService();

        // Act
        var result = await sut.RefreshTokenAsync(new RefreshTokenRequestDto { RefreshToken = "valid-refresh-token" });

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Token.Should().Be("new-jwt-token");
        result.Value.RefreshToken.Should().Be("rotated-refresh-token");
    }

    [Fact]
    public async Task RevokeToken_UnknownOrUnauthorizedToken_ShouldReturnNotFound()
    {
        // Arrange
        _currentUserMock.Setup(u => u.GetUserId()).Returns("user-1");
        _currentUserMock.Setup(u => u.IsAdmin()).Returns(false);
        _authRepoMock.Setup(r => r.RevokeTokenAsync("unknown-token", "user-1", false))
            .ReturnsAsync(false);

        var sut = CreateAuthService();

        // Act
        var result = await sut.RevokeTokenAsync(new RevokeTokenRequestDto { RefreshToken = "unknown-token" });

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task CreateReview_CompletedAppointmentByOwnerCustomer_ShouldSucceed()
    {
        // Arrange
        var appointment = new Appointment
        {
            Id = 15,
            CustomerId = 3,
            BarberId = 8,
            BarberShopId = 2,
            Status = AppointmentStatus.Completed,
            Customer = new Customer { Id = 3, Name = "Carlos" },
            Barber = new Barber { Id = 8, Name = "Miguel" }
        };

        _appointmentRepoMock.Setup(r => r.GetAppointmentById(15)).ReturnsAsync(appointment);
        _reviewRepoMock.Setup(r => r.GetByAppointmentIdAsync(15)).ReturnsAsync((Review?)null);
        _reviewRepoMock.Setup(r => r.CreateAsync(It.IsAny<Review>()))
            .ReturnsAsync((Review r) =>
            {
                r.Id = 50;
                return r;
            });

        _currentUserMock.Setup(u => u.IsInRole(UserRoles.Customer)).Returns(true);
        _currentUserMock.Setup(u => u.GetCustomerId()).Returns(3);

        var sut = CreateReviewService();

        // Act
        var result = await sut.CreateAsync(new ReviewCreateDto
        {
            AppointmentId = 15,
            Rating = 5,
            Comment = "Excelente corte!"
        });

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Rating.Should().Be(5);
        result.Value.BarberId.Should().Be(8);
        result.Value.BarberShopId.Should().Be(2);
    }

    [Fact]
    public async Task CreateReview_PendingAppointment_ShouldReturnValidationError()
    {
        // Arrange
        var appointment = new Appointment
        {
            Id = 15,
            CustomerId = 3,
            BarberId = 8,
            BarberShopId = 2,
            Status = AppointmentStatus.Pending
        };

        _appointmentRepoMock.Setup(r => r.GetAppointmentById(15)).ReturnsAsync(appointment);
        _currentUserMock.Setup(u => u.IsInRole(UserRoles.Customer)).Returns(true);
        _currentUserMock.Setup(u => u.GetCustomerId()).Returns(3);

        var sut = CreateReviewService();

        // Act
        var result = await sut.CreateAsync(new ReviewCreateDto
        {
            AppointmentId = 15,
            Rating = 4,
            Comment = "Ainda não aconteceu"
        });

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Review.AppointmentNotCompleted");
    }

    [Fact]
    public async Task CreateReview_DuplicateReview_ShouldReturnConflict()
    {
        // Arrange
        var appointment = new Appointment
        {
            Id = 15,
            CustomerId = 3,
            BarberId = 8,
            BarberShopId = 2,
            Status = AppointmentStatus.Completed
        };

        _appointmentRepoMock.Setup(r => r.GetAppointmentById(15)).ReturnsAsync(appointment);
        _reviewRepoMock.Setup(r => r.GetByAppointmentIdAsync(15)).ReturnsAsync(new Review { Id = 1, AppointmentId = 15, Rating = 5 });
        _currentUserMock.Setup(u => u.IsInRole(UserRoles.Customer)).Returns(true);
        _currentUserMock.Setup(u => u.GetCustomerId()).Returns(3);

        var sut = CreateReviewService();

        // Act
        var result = await sut.CreateAsync(new ReviewCreateDto
        {
            AppointmentId = 15,
            Rating = 5
        });

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public async Task GetDashboard_OwnerOfDifferentShop_ShouldReturnForbidden()
    {
        // Arrange
        _currentUserMock.Setup(u => u.IsAdmin()).Returns(false);
        _currentUserMock.Setup(u => u.GetBarberShopId()).Returns(10);

        var sut = CreateBarberShopService();

        // Act
        var result = await sut.GetDashboardAsync(99);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Type.Should().Be(ErrorType.Forbidden);
    }

    [Fact]
    public async Task GetDashboard_ValidOwner_ShouldReturnMetrics()
    {
        // Arrange
        _currentUserMock.Setup(u => u.IsAdmin()).Returns(false);
        _currentUserMock.Setup(u => u.GetBarberShopId()).Returns(10);
        _barberShopRepoMock.Setup(r => r.ExistsAsync(10)).ReturnsAsync(true);
        _barberShopRepoMock.Setup(r => r.GetDashboardMetricsAsync(10, null, null))
            .ReturnsAsync(new BarberShopDashboardDto
            {
                BarberShopId = 10,
                TotalAppointments = 20,
                CompletedAppointments = 15,
                CancelledAppointments = 2,
                CancellationRatePercentage = 10.0,
                TotalRevenue = 300m,
                EstimatedRevenue = 360m,
                AverageRating = 4.8,
                TotalReviews = 12
            });

        var sut = CreateBarberShopService();

        // Act
        var result = await sut.GetDashboardAsync(10);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.TotalRevenue.Should().Be(300m);
        result.Value.AverageRating.Should().Be(4.8);
    }

    [Fact]
    public async Task GetMe_AuthenticatedUser_ShouldReturnCurrentUser()
    {
        // Arrange
        _currentUserMock.Setup(u => u.GetUserId()).Returns("user-123");
        _authRepoMock.Setup(r => r.GetCurrentUserAsync("user-123"))
            .ReturnsAsync(new CurrentUserDto
            {
                Id = "user-123",
                FullName = "João Silva",
                Email = "joao@clipper.com",
                PhoneNumber = "11999999999",
                Role = UserRoles.Customer,
                Roles = [UserRoles.Customer],
                StateAccount = "Active",
                CustomerId = 42
            });

        var sut = CreateAuthService();

        // Act
        var result = await sut.GetMeAsync();

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be("user-123");
        result.Value.Role.Should().Be(UserRoles.Customer);
        result.Value.CustomerId.Should().Be(42);
    }

    [Fact]
    public async Task GetMe_UnauthenticatedUser_ShouldReturnUnauthorized()
    {
        // Arrange
        _currentUserMock.Setup(u => u.GetUserId()).Returns((string?)null);
        var sut = CreateAuthService();

        // Act
        var result = await sut.GetMeAsync();

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Type.Should().Be(ErrorType.Unauthorized);
    }

    [Fact]
    public async Task GetMe_UserNotFound_ShouldReturnNotFound()
    {
        // Arrange
        _currentUserMock.Setup(u => u.GetUserId()).Returns("missing-user");
        _authRepoMock.Setup(r => r.GetCurrentUserAsync("missing-user"))
            .ReturnsAsync((CurrentUserDto?)null);
        var sut = CreateAuthService();

        // Act
        var result = await sut.GetMeAsync();

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Type.Should().Be(ErrorType.NotFound);
    }
}
