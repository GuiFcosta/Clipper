using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Clipper.Api.Services;
using FluentAssertions;
using Moq;

namespace Clipper.Tests;

public class AvailabilityServiceTests
{
    // Mock of the repository (fake object)
    private readonly Mock<IAvailabilityServiceRepository> _repoMock;
    // Real service under test
    private readonly AvailabilityService _sut; // system under test
    
    public AvailabilityServiceTests()
    {
        _repoMock = new Mock<IAvailabilityServiceRepository>();
        // Inject the mock into the service
        _sut = new AvailabilityService(_repoMock.Object);
    }

    [Fact]
    public async Task GetAvailability_ShouldReturnExpectedAvailability()
    {
        // Arrange - set up the mock repository to return controlled data
        var barberId = 1;
        var date = new DateTime(2026, 1, 23);
        var serviceDuration = 60; // in minutes
        
        // Fake schedule, service and appointments
        var fakeSchedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            LunchBreakStartTime = new TimeSpan(12,0, 0),
            LunchBreakEndTime =  new TimeSpan(13, 0, 0),
            EndTime = new TimeSpan(17, 0, 0)
        };
        var fakeService = new Service
        {
            Duration = serviceDuration
        };
        var fakeAppointments = new List<Appointment>
        {
            new Appointment
            {
                StartTime = date.AddHours(10),
                Service = fakeService
            },
            new Appointment
            {
                StartTime = date.AddHours(15),
                Service = fakeService
            }
        };
        
        // Set up the mock to return the fake data
        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync(fakeSchedule);
        
        _repoMock.Setup(r => r.GetBarberAppointmentsAsync(barberId, DateOnly.FromDateTime(date)))
            .ReturnsAsync(fakeAppointments);
        
        // Act - call the method under test
        var result = await _sut.GetAvailableTimeSlots(barberId, DateOnly.FromDateTime(date), TimeSpan.FromMinutes(serviceDuration));
        
        // Assert - verify the results
        result.Should().HaveCount(5);
        
        result.Should().Contain(new TimeSpan(9, 0, 0));
        result.Should().Contain(new TimeSpan(11, 0, 0));
        result.Should().Contain(new TimeSpan(13, 0, 0));
        result.Should().Contain(new TimeSpan(14, 0, 0));
        result.Should().Contain(new TimeSpan(16, 0, 0));
        
        result.Should().NotContain(new TimeSpan(10, 0, 0));
        result.Should().NotContain(new TimeSpan(12, 0, 0));
        result.Should().NotContain(new TimeSpan(15, 0, 0));
    }

    [Fact]
    public async Task GetAvailabilitySlots_NoSchedule_ShouldReturnEmpty()
    {
        // Arrange
        var barberId = 1;
        var date = new DateTime(2026, 1, 25);
        var serviceDuration = 60; // in minutes

        // Set up the mock to return null schedule
        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync((BarberSchedule?)null);

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, DateOnly.FromDateTime(date), TimeSpan.FromMinutes(serviceDuration));

        // Assert
        result.Should().BeEmpty();
    }
}