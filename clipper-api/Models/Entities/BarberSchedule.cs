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
    
    public TimeSpan StartTime { get; set; }
    public TimeSpan LunchBreakStartTime { get; set; }
    public TimeSpan LunchBreakEndTime { get; set; }
    public TimeSpan EndTime { get; set; }
}