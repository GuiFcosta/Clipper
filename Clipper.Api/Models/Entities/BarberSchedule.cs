using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clipper.Api.Models.Entities;

public class BarberSchedule
{
    [Key]
    public int Id { get; set; }
    
    [ForeignKey(nameof(Barber))]
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;
    
    public DayOfWeek DayOfWeek { get; set; }
    
    public TimeOnly StartTime { get; set; }
    public TimeOnly LunchBreakStartTime { get; set; }
    public TimeOnly LunchBreakEndTime { get; set; }
    public TimeOnly EndTime { get; set; }
}