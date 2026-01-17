using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Models.Entities;

public class Service
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public int Duration { get; set; }
    [Required]
    public string Description { get; set; } = null!;
    [Required, Precision(18, 2)]
    public decimal Price { get; set; }
    
    public bool IsActive { get; set; } = true;
}