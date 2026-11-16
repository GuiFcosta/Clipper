using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Models.Entities;

public class Service
{
    [Key]
    public int Id { get; set; }
    [Required, StringLength(30)]
    public string Name { get; set; } = null!;
    [Required, Range(1, 120)]
    public int Duration { get; set; }
    [Required, StringLength(300)]
    public string Description { get; set; } = null!;
    [Required, Precision(18, 2)]
    public decimal Price { get; set; }
    [Required]
    public bool IsActive { get; set; } = true;

    [Required]
    public int BarberShopId { get; set; }
    [JsonIgnore]
    public BarberShop BarberShop { get; set; } = null!;
}