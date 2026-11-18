using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Appointment;
using Clipper.Api.Models.Dto.TimeBlock;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Clipper.Api.Services;
using FluentAssertions;
using Moq;

namespace Clipper.Tests;

public class AppointmentAndTimeBlockServiceTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepoMock = new();
    private readonly Mock<IBarberRepository> _barberRepoMock = new();
    private readonly Mock<ICustomerRepository> _customerRepoMock = new();
    private readonly Mock<IAvailabilityService> _availabilityServiceMock = new();
    private readonly Mock<ITimeBlockRepository> _timeBlockRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private AppointmentService CreateAppointmentService() =>
        new(
            _appointmentRepoMock.Object,
            _barberRepoMock.Object,
            _customerRepoMock.Object,
            _availabilityServiceMock.Object,
            _currentUserMock.Object);

    private TimeBlockService CreateTimeBlockService() =>
        new(
            _timeBlockRepoMock.Object,
            _barberRepoMock.Object,
            _currentUserMock.Object);

    [Fact]
    public async Task CreateAppointment_CustomerLogged_UsesCustomerClaimIdAndPreventsSpoofing()
    {
        // Arrange
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        _currentUserMock.Setup(u => u.IsInRole(UserRoles.Customer)).Returns(true);
        _currentUserMock.Setup(u => u.GetCustomerId()).Returns(42);

        _customerRepoMock.Setup(r => r.GetCustomerById(42))
            .ReturnsAsync(new Customer { Id = 42, Name = "Real Customer", Email = "real@test.com", PhoneNumber = "910000000" });

        _barberRepoMock.Setup(r => r.GetBarberById(5))
            .ReturnsAsync(new Barber { Id = 5, Name = "João", BarberShopId = 10 });

        _appointmentRepoMock.Setup(r => r.GetServiceById(7))
            .ReturnsAsync(new Service { Id = 7, Name = "Corte", Duration = 30, Price = 15m, IsActive = true, BarberShopId = 10 });

        _availabilityServiceMock
            .Setup(s => s.GetAvailableTimeSlots(5, tomorrow, TimeSpan.FromMinutes(30)))
            .ReturnsAsync([new TimeSpan(10, 0, 0)]);

        _appointmentRepoMock
            .Setup(r => r.CreateAppointment(It.IsAny<Appointment>()))
            .ReturnsAsync((Appointment a) =>
            {
                a.Id = 100;
                return a;
            });

        var sut = CreateAppointmentService();
        var dto = new AppointmentCreateDto
        {
            CustomerId = 999, // Attempting to spoof another customer
            BarberId = 5,
            BarberShopId = 10,
            ServiceId = 7,
            AppointmentDate = tomorrow.ToString("yyyy-MM-dd"),
            AppointmentTime = "10:00",
            Notes = "Fade"
        };

        // Act
        var result = await sut.CreateAsync(dto);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.CustomerId.Should().Be(42);
        result.Value.Status.Should().Be(AppointmentStatus.Pending);
    }

    [Fact]
    public async Task CreateAppointment_ServiceFromAnotherBarberShop_ShouldReturnValidationError()
    {
        // Arrange
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        _currentUserMock.Setup(u => u.IsInRole(UserRoles.Customer)).Returns(true);
        _currentUserMock.Setup(u => u.GetCustomerId()).Returns(1);

        _customerRepoMock.Setup(r => r.GetCustomerById(1))
            .ReturnsAsync(new Customer { Id = 1, Name = "Cliente", Email = "c@test.com", PhoneNumber = "910000000" });

        _barberRepoMock.Setup(r => r.GetBarberById(5))
            .ReturnsAsync(new Barber { Id = 5, Name = "João", BarberShopId = 10 });

        _appointmentRepoMock.Setup(r => r.GetServiceById(7))
            .ReturnsAsync(new Service { Id = 7, Name = "Corte", Duration = 30, Price = 15m, IsActive = true, BarberShopId = 99 }); // Different shop!

        var sut = CreateAppointmentService();
        var dto = new AppointmentCreateDto
        {
            BarberId = 5,
            BarberShopId = 10,
            ServiceId = 7,
            AppointmentDate = tomorrow.ToString("yyyy-MM-dd"),
            AppointmentTime = "10:00"
        };

        // Act
        var result = await sut.CreateAsync(dto);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Type.Should().Be(ErrorType.Validation);
        result.Error.Code.Should().Be("Appointment.ServiceShopMismatch");
    }

    [Fact]
    public async Task ConfirmAndCompleteAppointment_Lifecycle_ShouldTransitionCorrectly()
    {
        // Arrange
        var appointment = new Appointment
        {
            Id = 1,
            CustomerId = 10,
            BarberId = 5,
            BarberShopId = 2,
            ServiceId = 3,
            StartTime = DateTime.UtcNow.AddHours(2),
            Status = AppointmentStatus.Pending,
            Service = new Service { Id = 3, Duration = 30 }
        };

        _appointmentRepoMock.Setup(r => r.GetAppointmentById(1)).ReturnsAsync(appointment);
        _currentUserMock.Setup(u => u.IsInRole(UserRoles.Barber)).Returns(true);
        _currentUserMock.Setup(u => u.GetBarberId()).Returns(5);

        var sut = CreateAppointmentService();

        // Act 1: Confirm
        var confirmResult = await sut.ConfirmAsync(1);
        confirmResult.IsSuccess.Should().BeTrue();
        confirmResult.Value.Status.Should().Be(AppointmentStatus.Confirmed);

        // Act 2: Complete
        var completeResult = await sut.CompleteAsync(1);
        completeResult.IsSuccess.Should().BeTrue();
        completeResult.Value.Status.Should().Be(AppointmentStatus.Completed);

        // Act 3: Cannot cancel after completed
        var cancelResult = await sut.CancelAsync(1);
        cancelResult.IsFailure.Should().BeTrue();
        cancelResult.Error.Code.Should().Be("Appointment.CannotCancelCompleted");
    }

    [Fact]
    public async Task CreateTimeBlock_UnauthorizedBarberFromDifferentShop_ShouldReturnForbidden()
    {
        // Arrange
        _barberRepoMock.Setup(r => r.GetBarberById(5))
            .ReturnsAsync(new Barber { Id = 5, BarberShopId = 10 });

        _currentUserMock.Setup(u => u.IsInRole(UserRoles.Barber)).Returns(true);
        _currentUserMock.Setup(u => u.GetBarberId()).Returns(99); // Another barber!

        var sut = CreateTimeBlockService();
        var dto = new TimeBlockCreateDto
        {
            BarberId = 5,
            StartDateTime = DateTime.UtcNow.AddDays(1),
            EndDateTime = DateTime.UtcNow.AddDays(1).AddHours(2),
            Reason = "Consulta médica"
        };

        // Act
        var result = await sut.CreateAsync(dto);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Type.Should().Be(ErrorType.Forbidden);
    }
}
