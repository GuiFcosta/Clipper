namespace Clipper.Api.Models.Dto.Customer;

public class CustomerCreateDto
{
    public string Name { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
}