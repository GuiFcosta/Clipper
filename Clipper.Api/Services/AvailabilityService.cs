using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;

namespace Clipper.Api.Services;

public class AvailabilityService(IAvailabilityServiceRepository serviceRepository)
{
    private const int SlotIntervalMinutes = 15;
    
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