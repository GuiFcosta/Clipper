using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;

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

        if (date < DateOnly.FromDateTime(DateTime.Now))
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

        // Adicionar consultas agendadas
        var appointments = await serviceRepository.GetBarberAppointmentsAsync(barberId, date);
        occupiedSlots.AddRange(appointments.Select(a => (a.StartTime.TimeOfDay, a.EndTime.TimeOfDay)));

        // Adicionar blocos de tempo indisponíveis
        var timeBlocks = await serviceRepository.GetBarberTimeBlocksAsync(barberId, date);
        occupiedSlots.AddRange(timeBlocks.Select(tb => (tb.StartDateTime.TimeOfDay, tb.EndDateTime.TimeOfDay)));

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