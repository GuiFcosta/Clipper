using System.ComponentModel.DataAnnotations;
using Clipper.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace Clipper.Api.Models.Entities;

public class ApplicationUser : IdentityUser
{
    [Required, StringLength(50)]
    public string FullName { get; set; } = string.Empty;
    public int? BarberShopId { get; set; }
    public StateAccount StateAccount { get; set; } = StateAccount.Pending;
} 