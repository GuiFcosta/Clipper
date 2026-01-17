using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Entities;

public class Customer
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public string PhoneNumber { get; set; } = null!;
    [Required]
    public string Email { get; set; } = null!;
    
    // List of appointments for the customer
    public ICollection<Appointment>? Appointments { get; set; } = new List<Appointment>();
}