namespace Clipper.Api.Models.Dto.Barber;

public class ScheduleDto
{
    public int BarberId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string LunchBreakStartTime { get; set; } = string.Empty;
    public string LunchBreakEndTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}