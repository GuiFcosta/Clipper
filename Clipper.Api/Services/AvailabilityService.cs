using Clipper.Api.Interfaces;

namespace Clipper.Api.Services;

public class AvailabilityService(IAvailabilityServiceRepository serviceRepository)
{
    /// <summary>
    /// Intervalo padrão para os slots disponíveis (em minutos).
    /// Por exemplo: 15 minutos para gerar slots a cada 15 min (09:00, 09:15, 09:30, etc)
    /// </summary>
    private const int SlotIntervalMinutes = 15;

    /// <summary>
    /// Obtém os slots de tempo disponíveis para um barbeiro numa data específica.
    /// </summary>
    /// <param name="barberId">ID do barbeiro</param>
    /// <param name="date">Data para a qual obter disponibilidade</param>
    /// <param name="appointmentDuration">Duração da consulta (ex: 30 minutos)</param>
    /// <returns>Lista de horas de início disponíveis</returns>
    public async Task<IEnumerable<TimeSpan>> GetAvailableTimeSlots(int barberId, DateOnly date, TimeSpan appointmentDuration)
    {
        // Validações
        if (barberId <= 0)
            throw new ArgumentException("BarberId deve ser positivo.", nameof(barberId));

        if (appointmentDuration <= TimeSpan.Zero)
            throw new ArgumentException("A duração da consulta deve ser positiva.", nameof(appointmentDuration));

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

    /// <summary>
    /// Obtém todos os períodos ocupados (consultas, blocos de tempo e pausa de almoço).
    /// </summary>
    private async Task<List<(TimeSpan Start, TimeSpan End)>> GetOccupiedSlotsAsync(int barberId, DateOnly date, Models.Entities.BarberSchedule schedule)
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

    /// <summary>
    /// Gera a lista de slots disponíveis baseado no horário e períodos ocupados.
    /// </summary>
    private List<TimeSpan> GenerateAvailableSlots(Models.Entities.BarberSchedule schedule, List<(TimeSpan Start, TimeSpan End)> occupiedSlots, TimeSpan appointmentDuration)
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

    /// <summary>
    /// Verifica se um slot de tempo colide com algum período ocupado.
    /// </summary>
    private static bool HasConflict(TimeSpan slotStart, TimeSpan slotEnd, List<(TimeSpan Start, TimeSpan End)> occupiedSlots)
    {
        return occupiedSlots.Any(occupied => slotStart < occupied.End && slotEnd > occupied.Start);
    }
}