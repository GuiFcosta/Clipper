using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Models.Entities;

public class BarberShop
{
    [Key]
    public int Id { get; set; }
    [Required, StringLength(30)]
    public string Name { get; set; } = null!;
    [Required, StringLength(100)]
    public string Address { get; set; } = null!;
    [Required, StringLength(12)]
    public string PhoneNumber { get; set; } = null!;
    [Required, StringLength(30)]
    public string Email { get; set; } = null!;
    
    // List of barbers working at the barber shop
    public ICollection<Barber>? Barbers { get; set; } = new List<Barber>();
    
    // List of services offered by the barber shop
    public ICollection<Service>? Services { get; set; } = new List<Service>();
}