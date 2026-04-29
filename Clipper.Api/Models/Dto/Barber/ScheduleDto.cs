namespace Clipper.Api.Models.Dto.Barber;

public class ScheduleDto
{
    public int BarberId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string StartTime { get; set; }
    public string LunchBreakStartTime { get; set; }
    public string LunchBreakEndTime { get; set; }
    public string EndTime { get; set; }
}