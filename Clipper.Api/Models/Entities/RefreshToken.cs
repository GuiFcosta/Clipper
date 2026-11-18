using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clipper.Api.Models.Entities;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(200)]
    public string Token { get; set; } = string.Empty;

    [Required, StringLength(450)]
    [ForeignKey(nameof(ApplicationUser))]
    public string ApplicationUserId { get; set; } = string.Empty;
    public ApplicationUser ApplicationUser { get; set; } = null!;

    [Required]
    public DateTime ExpiresAtUtc { get; set; }

    [Required]
    public DateTime CreatedAtUtc { get; set; }

    public DateTime? RevokedAtUtc { get; set; }

    [StringLength(200)]
    public string? ReplacedByToken { get; set; }

    [NotMapped]
    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;

    [NotMapped]
    public bool IsRevoked => RevokedAtUtc.HasValue;

    [NotMapped]
    public bool IsActive => !IsRevoked && !IsExpired;
}
