using Clipper.Api.Common;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;

namespace Clipper.Api.Services;

public interface IAvailabilityService
{
    Task<IEnumerable<TimeSpan>> GetAvailableTimeSlots(int barberId, DateOnly date, TimeSpan appointmentDuration);
    Task<Result<IEnumerable<TimeSpan>>> GetAvailableSlotsByServiceAsync(int barberId, DateOnly date, int serviceId);
}

public class AvailabilityService(
    IAvailabilityServiceRepository serviceRepository,
    IServiceRepository? catalogRepository = null,
    IBarberRepository? barberRepository = null) : IAvailabilityService
{
    private const int SlotIntervalMinutes = 15;

    public async Task<Result<IEnumerable<TimeSpan>>> GetAvailableSlotsByServiceAsync(int barberId, DateOnly date, int serviceId)
    {
        if (barberId <= 0)
            return Result.Failure<IEnumerable<TimeSpan>>(Error.Validation("Availability.InvalidBarberId", "BarberId should be positive."));

        if (serviceId <= 0)
            return Result.Failure<IEnumerable<TimeSpan>>(Error.Validation("Availability.InvalidServiceId", "ServiceId should be positive."));

        if (barberRepository != null)
        {
            var barber = await barberRepository.GetBarberById(barberId);
            if (barber == null)
                return Result.Failure<IEnumerable<TimeSpan>>(Error.NotFound("Barber.NotFound", $"Barber with ID {barberId} was not found."));

            if (catalogRepository != null)
            {
                var service = await catalogRepository.GetServiceById(serviceId);
                if (service == null || !service.IsActive)
                    return Result.Failure<IEnumerable<TimeSpan>>(Error.NotFound("Service.NotFound", $"Active service with ID {serviceId} was not found."));

                if (barber.BarberShopId != service.BarberShopId)
                    return Result.Failure<IEnumerable<TimeSpan>>(Error.Validation("Availability.ShopMismatch", "The selected service does not belong to this barber's shop."));

                var slots = await GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(service.Duration));
                return Result.Success(slots);
            }
        }

        if (catalogRepository == null)
            return Result.Failure<IEnumerable<TimeSpan>>(Error.Failure("Availability.NotConfigured", "Service catalog repository is not configured."));

        var fallbackService = await catalogRepository.GetServiceById(serviceId);
        if (fallbackService == null || !fallbackService.IsActive)
            return Result.Failure<IEnumerable<TimeSpan>>(Error.NotFound("Service.NotFound", $"Active service with ID {serviceId} was not found."));

        var resultSlots = await GetAvailableTimeSlots(barberId, date, TimeSpan.FromMinutes(fallbackService.Duration));
        return Result.Success(resultSlots);
    }

    public async Task<IEnumerable<TimeSpan>> GetAvailableTimeSlots(int barberId, DateOnly date, TimeSpan appointmentDuration)
    {
        // Validações
        if (barberId <= 0)
            throw new ArgumentException("BarberId should be positive.", nameof(barberId));

        if (appointmentDuration <= TimeSpan.Zero)
            throw new ArgumentException("The appointment duration should be greater than zero.", nameof(appointmentDuration));

        if (date < DateOnly.FromDateTime(DateTime.UtcNow))
            return Enumerable.Empty<TimeSpan>();

        // Obter o horário do barbeiro
        var schedule = await serviceRepository.GetBarberScheduleAsync(barberId, date.DayOfWeek);
        if (schedule == null)
            return Enumerable.Empty<TimeSpan>();

        // Obter períodos ocupados (consultas + blocos de tempo)
        var occupiedSlots = await GetOccupiedSlotsAsync(barberId, date, schedule);

        // Gerar slots disponíveis
        var availableSlots = GenerateAvailableSlots(schedule, occupiedSlots, appointmentDuration);

        return availableSlots;
    }

    private async Task<List<(TimeSpan Start, TimeSpan End)>> GetOccupiedSlotsAsync(int barberId, DateOnly date, BarberSchedule schedule)
    {
        var occupiedSlots = new List<(TimeSpan Start, TimeSpan End)>();

        // Adicionar consultas agendadas (ignorando canceladas por segurança também no serviço)
        var appointments = await serviceRepository.GetBarberAppointmentsAsync(barberId, date);
        occupiedSlots.AddRange(appointments
            .Where(a => a.Status != AppointmentStatus.Cancelled)
            .Select(a => (a.StartTime.TimeOfDay, a.EndTime.TimeOfDay)));

        // Adicionar blocos de tempo indisponíveis (suportando blocos intradia e múltiplos dias)
        var timeBlocks = await serviceRepository.GetBarberTimeBlocksAsync(barberId, date);
        var dayStart = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var dayEnd = date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        foreach (var tb in timeBlocks)
        {
            var startUtc = DateTime.SpecifyKind(tb.StartDateTime, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(tb.EndDateTime, DateTimeKind.Utc);

            var blockStart = startUtc <= dayStart ? TimeSpan.Zero : startUtc.TimeOfDay;
            var blockEnd = endUtc >= dayEnd ? TimeSpan.FromHours(24) : endUtc.TimeOfDay;

            if (blockStart < blockEnd)
                occupiedSlots.Add((blockStart, blockEnd));
        }

        // Adicionar pausa de almoço (se configurada)
        if (schedule.LunchBreakStartTime < schedule.LunchBreakEndTime)
            occupiedSlots.Add((schedule.LunchBreakStartTime, schedule.LunchBreakEndTime));

        return occupiedSlots;
    }

    private List<TimeSpan> GenerateAvailableSlots(BarberSchedule schedule, List<(TimeSpan Start, TimeSpan End)> occupiedSlots, TimeSpan appointmentDuration)
    {
        var availableSlots = new List<TimeSpan>();
        var slotInterval = TimeSpan.FromMinutes(SlotIntervalMinutes);
        var currentTime = schedule.StartTime;

        while (currentTime + appointmentDuration <= schedule.EndTime)
        {
            var slotEndTime = currentTime + appointmentDuration;

            // Verificar se este slot colide com qualquer período ocupado
            if (!HasConflict(currentTime, slotEndTime, occupiedSlots))
            {
                availableSlots.Add(currentTime);
            }

            currentTime = currentTime.Add(slotInterval);
        }

        return availableSlots;
    }

    private static bool HasConflict(TimeSpan slotStart, TimeSpan slotEnd, List<(TimeSpan Start, TimeSpan End)> occupiedSlots)
    {
        return occupiedSlots.Any(occupied => slotStart < occupied.End && slotEnd > occupied.Start);
    }
}
