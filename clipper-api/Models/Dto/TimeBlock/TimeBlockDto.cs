using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Dto.TimeBlock;

public class TimeBlockDto
{
    public int Id { get; set; }
    public int BarberId { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class TimeBlockCreateDto
{
    [Required]
    public int BarberId { get; set; }

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Required, StringLength(200)]
    public string Reason { get; set; } = string.Empty;
}
