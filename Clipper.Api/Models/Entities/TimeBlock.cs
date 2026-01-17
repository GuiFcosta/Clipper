using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Antiforgery;

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
    [Required]
    public string Reason { get; set; } = null!;
}