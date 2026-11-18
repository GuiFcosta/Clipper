using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clipper.Api.Models.Entities;

public class TimeBlock
{
    [Key]
    public int Id { get; set; }
    
    [ForeignKey(nameof(Barber))]
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;
    
    [Required]
    public DateTime StartDateTime { get; set; }
    [Required]
    public DateTime EndDateTime { get; set; }
    [Required, StringLength(200)]
    public string Reason { get; set; } = null!;
}