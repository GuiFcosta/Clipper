using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Models.Entities;

public class BarberShop
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public string Address { get; set; } = null!;
    [Required]
    public string PhoneNumber { get; set; } = null!;
    [Required]
    public string Email { get; set; } = null!;
    
    // List of barbers working at the barber shop
    public ICollection<Barber>? Barbers { get; set; } = new List<Barber>();
}