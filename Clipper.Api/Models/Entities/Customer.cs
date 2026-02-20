using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Entities;

public class Customer
{
    [Key]
    public int Id { get; set; }
    [Required, StringLength(50)]
    public string Name { get; set; } = null!;
    [Required, StringLength(12)]
    public string PhoneNumber { get; set; } = null!;
    [Required, StringLength(50)]
    public string Email { get; set; } = null!;
    
    [Required, StringLength(450)]
    public string ApplicationUserId { get; set; } = string.Empty;
    public ApplicationUser ApplicationUser { get; set; } = null!;
    
    // List of appointments for the customer
    public ICollection<Appointment>? Appointments { get; set; } = new List<Appointment>();
}