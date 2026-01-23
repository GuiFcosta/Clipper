using Clipper.Api.Interfaces;

namespace Clipper.Api.Services;

public class AvailabilityService(IAvailabilityService service)
{
    public async Task<IEnumerable<TimeSpan>> GetAvailableTimeSlots(int barberId, DateOnly date, TimeSpan appointmentDuration)
    {
        var schedule = await service.GetBarberScheduleAsync(barberId, date.DayOfWeek);
        if (schedule == null)
            return Enumerable.Empty<TimeSpan>();

        var appointments = await service.GetBarberAppointmentsAsync(barberId, date);
        var timeBlocks = await service.GetBarberTimeBlocksAsync(barberId, date);

        var unavailableSlots = new List<(TimeSpan Start, TimeSpan End)>();

        unavailableSlots.AddRange(appointments.Select(a => (a.StartTime.TimeOfDay, a.EndTime.TimeOfDay)));
        unavailableSlots.AddRange(timeBlocks.Select(tb => (tb.StartDateTime.TimeOfDay, tb.EndDateTime.TimeOfDay)));
        if(schedule.LunchBreakStartTime < schedule.LunchBreakEndTime)
            unavailableSlots.Add((schedule.LunchBreakStartTime, schedule.LunchBreakEndTime));

        var availableSlots = new List<TimeSpan>();
        var currentTime = schedule.StartTime;

        while (currentTime + appointmentDuration <= schedule.EndTime)
        {
            var slotEndTime = currentTime + appointmentDuration;
            if (!unavailableSlots.Any(us => currentTime < us.End && slotEndTime > us.Start))
            {
                availableSlots.Add(currentTime);
            }
            currentTime = currentTime.Add(appointmentDuration);
        }

        return availableSlots;
    }
}