using System.ComponentModel.DataAnnotations;

namespace Clipper.Api.Models.Dto.Service;

public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public int BarberShopId { get; set; }
}

public class ServiceCreateDto
{
    [Required, StringLength(30)]
    public string Name { get; set; } = string.Empty;

    [Required, Range(1, 120)]
    public int Duration { get; set; }

    [Required, StringLength(300)]
    public string Description { get; set; } = string.Empty;

    [Required, Range(0.01, 10000)]
    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

    public int? BarberShopId { get; set; }
}
