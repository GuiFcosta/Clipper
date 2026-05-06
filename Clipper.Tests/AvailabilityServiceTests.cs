using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Clipper.Api.Services;
using FluentAssertions;
using Moq;

namespace Clipper.Tests;

public class AvailabilityServiceTests
{
    private readonly Mock<IAvailabilityServiceRepository> _repoMock;
    private readonly AvailabilityService _sut;
    
    public AvailabilityServiceTests()
    {
        _repoMock = new Mock<IAvailabilityServiceRepository>();
        _sut = new AvailabilityService(_repoMock.Object);
    }

    #region Helper Methods

    /// <summary>
    /// Cria uma entidade Appointment com duração específica.
    /// </summary>
    private static Appointment CreateAppointment(DateTime startTime, int durationMinutes)
    {
        return new Appointment
        {
            StartTime = startTime,
            Service = new Service { Duration = durationMinutes },
            Status = AppointmentStatus.Confirmed,
            CustomerId = 1,
            BarberId = 1,
            BarberShopId = 1,
            ServiceId = 1
        };
    }

    /// <summary>
    /// Configura o mock padrão com schedule, appointments e timeBlocks vazios.
    /// </summary>
    private void SetupDefaultMocks(int barberId, DateOnly date, BarberSchedule? schedule = null)
    {
        schedule ??= new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = new TimeSpan(12, 0, 0),
            LunchBreakEndTime = new TimeSpan(13, 0, 0)
        };

        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync(schedule);

        _repoMock.Setup(r => r.GetBarberAppointmentsAsync(barberId, date))
            .ReturnsAsync(new List<Appointment>());

        _repoMock.Setup(r => r.GetBarberTimeBlocksAsync(barberId, date))
            .ReturnsAsync(new List<TimeBlock>());
    }

    #endregion

    #region Happy Path Tests

    [Fact]
    public async Task GetAvailableTimeSlots_SimpleScenario_ShouldReturnCorrectSlots()
    {
        // Arrange - barbeiro trabalha 09:00-17:00 com pausa 12:00-13:00, sem consultas
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1)); // Amanhã (futuro)
        var serviceDuration = TimeSpan.FromMinutes(30);

        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = new TimeSpan(12, 0, 0),
            LunchBreakEndTime = new TimeSpan(13, 0, 0)
        };

        SetupDefaultMocks(barberId, date, schedule);

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, serviceDuration);
        var slots = result.ToList();

        // Assert - slots a cada 15 min (09:00, 09:15, 09:30... até 16:45)
        // Excluir pausa de almoço (12:00-13:00)
        slots.Should().NotBeEmpty();
        slots.Should().Contain(new TimeSpan(9, 0, 0));
        slots.Should().Contain(new TimeSpan(9, 15, 0));
        slots.Should().Contain(new TimeSpan(9, 30, 0));
        
        // Pausa de almoço deve estar ausente
        slots.Should().NotContain(new TimeSpan(12, 0, 0));
        slots.Should().NotContain(new TimeSpan(12, 15, 0));
        slots.Should().NotContain(new TimeSpan(12, 30, 0));
        slots.Should().NotContain(new TimeSpan(12, 45, 0));
        
        // Depois da pausa deve ter slots disponíveis
        slots.Should().Contain(new TimeSpan(13, 0, 0));
    }

    [Fact]
    public async Task GetAvailableTimeSlots_WithAppointments_ShouldExcludeOccupiedSlots()
    {
        // Arrange - barbeiro com consulta 10:00-10:30
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var serviceDuration = TimeSpan.FromMinutes(30);
        var baseDateTime = DateTime.Now.AddDays(1).Date;

        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = TimeSpan.Zero,
            LunchBreakEndTime = TimeSpan.Zero
        };

        var appointment = CreateAppointment(baseDateTime.AddHours(10), 30);

        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync(schedule);

        _repoMock.Setup(r => r.GetBarberAppointmentsAsync(barberId, date))
            .ReturnsAsync(new List<Appointment> { appointment });

        _repoMock.Setup(r => r.GetBarberTimeBlocksAsync(barberId, date))
            .ReturnsAsync(new List<TimeBlock>());

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, serviceDuration);
        var slots = result.ToList();

        // Assert
        slots.Should().Contain(new TimeSpan(9, 0, 0)); // antes da consulta
        slots.Should().NotContain(new TimeSpan(10, 0, 0)); // início da consulta
        slots.Should().NotContain(new TimeSpan(10, 15, 0)); // dentro da consulta
        slots.Should().Contain(new TimeSpan(10, 30, 0)); // depois da consulta
    }

    [Fact]
    public async Task GetAvailableTimeSlots_WithTimeBlocks_ShouldExcludeBlockedPeriods()
    {
        // Arrange - barbeiro com bloco de tempo indisponível 14:00-15:00
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var serviceDuration = TimeSpan.FromMinutes(30);
        var baseDateTime = DateTime.Now.AddDays(1).Date;

        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = TimeSpan.Zero,
            LunchBreakEndTime = TimeSpan.Zero
        };

        var timeBlock = new TimeBlock
        {
            StartDateTime = baseDateTime.AddHours(14),
            EndDateTime = baseDateTime.AddHours(15),
            BarberId = barberId,
            Reason = "Break"
        };

        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync(schedule);

        _repoMock.Setup(r => r.GetBarberAppointmentsAsync(barberId, date))
            .ReturnsAsync(new List<Appointment>());

        _repoMock.Setup(r => r.GetBarberTimeBlocksAsync(barberId, date))
            .ReturnsAsync(new List<TimeBlock> { timeBlock });

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, serviceDuration);
        var slots = result.ToList();

        // Assert
        slots.Should().Contain(new TimeSpan(13, 30, 0)); // antes do bloco (13:30 + 30min = 14:00, que é quando começa o bloco)
        slots.Should().NotContain(new TimeSpan(14, 0, 0)); // dentro do bloco
        slots.Should().NotContain(new TimeSpan(14, 15, 0)); // dentro do bloco
        slots.Should().NotContain(new TimeSpan(14, 30, 0)); // dentro do bloco
        slots.Should().NotContain(new TimeSpan(14, 45, 0)); // dentro do bloco
        slots.Should().Contain(new TimeSpan(15, 0, 0)); // depois do bloco
    }

    #endregion

    #region Edge Cases & Validation Tests

    [Fact]
    public async Task GetAvailableTimeSlots_NoSchedule_ShouldReturnEmpty()
    {
        // Arrange
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));

        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync((BarberSchedule?)null);

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(30));

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableTimeSlots_PastDate_ShouldReturnEmpty()
    {
        // Arrange
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(-1)); // Data no passado
        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = TimeSpan.Zero,
            LunchBreakEndTime = TimeSpan.Zero
        };

        SetupDefaultMocks(barberId, date, schedule);

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(30));

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void GetAvailableTimeSlots_InvalidBarberId_ShouldThrow()
    {
        // Arrange
        var barberId = -1; // ID inválido
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));

        // Act & Assert
        _sut.Invoking(r => r.GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(30)))
            .Should()
            .ThrowAsync<ArgumentException>()
            .WithMessage("*BarberId deve ser positivo*");
    }

    [Fact]
    public void GetAvailableTimeSlots_InvalidDuration_ShouldThrow()
    {
        // Arrange
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var invalidDuration = TimeSpan.FromMinutes(-30); // Duração inválida

        // Act & Assert
        _sut.Invoking(r => r.GetAvailableTimeSlots(barberId, date, invalidDuration))
            .Should()
            .ThrowAsync<ArgumentException>()
            .WithMessage("*A duração da consulta deve ser positiva*");
    }

    [Fact]
    public async Task GetAvailableTimeSlots_LongAppointment_ShouldReturnFewerSlots()
    {
        // Arrange
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(11, 0, 0), // Apenas 2 horas
            LunchBreakStartTime = TimeSpan.Zero,
            LunchBreakEndTime = TimeSpan.Zero
        };

        var shortDuration = TimeSpan.FromMinutes(30);
        var longDuration = TimeSpan.FromMinutes(90); // Consulta muito longa

        SetupDefaultMocks(barberId, date, schedule);

        // Act
        var shortResult = await _sut.GetAvailableTimeSlots(barberId, date, shortDuration);
        var longResult = await _sut.GetAvailableTimeSlots(barberId, date, longDuration);

        // Assert - consulta longa deve ter menos slots disponíveis
        shortResult.Count().Should().BeGreaterThan(longResult.Count());
    }

    [Fact]
    public async Task GetAvailableTimeSlots_FullyBookedDay_ShouldReturnEmpty()
    {
        // Arrange - barbeiro com o dia completamente ocupado
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var baseDateTime = DateTime.Now.AddDays(1).Date;
        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = TimeSpan.Zero,
            LunchBreakEndTime = TimeSpan.Zero
        };

        var appointment = CreateAppointment(baseDateTime.AddHours(9), 480); // 8 horas

        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync(schedule);

        _repoMock.Setup(r => r.GetBarberAppointmentsAsync(barberId, date))
            .ReturnsAsync(new List<Appointment> { appointment });

        _repoMock.Setup(r => r.GetBarberTimeBlocksAsync(barberId, date))
            .ReturnsAsync(new List<TimeBlock>());

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(30));

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAvailableTimeSlots_ShorterWorkDay_ShouldShowLimitedSlots()
    {
        // Arrange - barbeiro trabalha apenas 1 hora (9:00-10:00)
        // Com uma consulta de 30 min e slots a cada 15 min:
        // 09:00 + 30min = OK
        // 09:15 + 30min = OK
        // 09:30 + 30min = OK
        // 09:45 + 30min = 10:15 (excede 10:00, inválido)
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(10, 0, 0),
            LunchBreakStartTime = TimeSpan.Zero,
            LunchBreakEndTime = TimeSpan.Zero
        };

        SetupDefaultMocks(barberId, date, schedule);

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(30));
        var slots = result.ToList();

        // Assert - devem haver 3 slots disponíveis
        slots.Should().HaveCount(3); // 09:00, 09:15, 09:30
        slots.Should().Contain(new TimeSpan(9, 0, 0));
        slots.Should().Contain(new TimeSpan(9, 15, 0));
        slots.Should().Contain(new TimeSpan(9, 30, 0));
    }

    [Fact]
    public async Task GetAvailableTimeSlots_MultipleConflicts_ShouldHandleCorrectly()
    {
        // Arrange - múltiplas consultas e blocos
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var baseDateTime = DateTime.Now.AddDays(1).Date;

        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = new TimeSpan(12, 0, 0),
            LunchBreakEndTime = new TimeSpan(13, 0, 0)
        };

        var appointments = new List<Appointment>
        {
            CreateAppointment(baseDateTime.AddHours(10), 30),
            CreateAppointment(baseDateTime.AddHours(14), 30)
        };

        var timeBlocks = new List<TimeBlock>
        {
            new TimeBlock { StartDateTime = baseDateTime.AddHours(15), EndDateTime = baseDateTime.AddHours(15).AddMinutes(30), BarberId = barberId, Reason = "Break" }
        };

        _repoMock.Setup(r => r.GetBarberScheduleAsync(barberId, date.DayOfWeek))
            .ReturnsAsync(schedule);

        _repoMock.Setup(r => r.GetBarberAppointmentsAsync(barberId, date))
            .ReturnsAsync(appointments);

        _repoMock.Setup(r => r.GetBarberTimeBlocksAsync(barberId, date))
            .ReturnsAsync(timeBlocks);

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(30));
        var slots = result.ToList();

        // Assert
        slots.Should().Contain(new TimeSpan(9, 0, 0)); // disponível
        slots.Should().NotContain(new TimeSpan(10, 0, 0)); // consulta
        slots.Should().Contain(new TimeSpan(11, 0, 0)); // disponível
        slots.Should().NotContain(new TimeSpan(12, 0, 0)); // almoço
        slots.Should().Contain(new TimeSpan(13, 0, 0)); // disponível
        slots.Should().NotContain(new TimeSpan(14, 0, 0)); // consulta
        slots.Should().NotContain(new TimeSpan(15, 0, 0)); // timeblock
        slots.Should().Contain(new TimeSpan(16, 0, 0)); // disponível
    }

    #endregion

    #region Schedule Tests

    [Fact]
    public async Task GetAvailableTimeSlots_NoLunchBreak_ShouldIncludeAllHours()
    {
        // Arrange - sem pausa de almoço
        var barberId = 1;
        var date = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var schedule = new BarberSchedule
        {
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0),
            LunchBreakStartTime = new TimeSpan(0, 0, 0),
            LunchBreakEndTime = new TimeSpan(0, 0, 0) // Sem almoço
        };

        SetupDefaultMocks(barberId, date, schedule);

        // Act
        var result = await _sut.GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(30));
        var slots = result.ToList();

        // Assert
        slots.Should().Contain(new TimeSpan(12, 0, 0)); // meio do dia disponível
        slots.Should().Contain(new TimeSpan(12, 30, 0)); // meio do dia disponível
    }

    #endregion
}