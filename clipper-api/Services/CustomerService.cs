using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Customer;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Services;

public interface ICustomerService
{
    Task<Result<PagedResult<CustomerDto>>> GetPagedAsync(int page, int pageSize, string? search = null);
    Task<Result<CustomerDto>> GetByIdAsync(int id);
    Task<Result<CustomerDto>> GetByEmailAsync(string email);
    Task<Result<CustomerDto>> GetByNameAsync(string name);
    Task<Result> UpdateAsync(int id, CustomerDto dto);
    Task<Result> DeleteAsync(int id);
}

public class CustomerService(
    ICustomerRepository repository,
    ICurrentUserService currentUserService) : ICustomerService
{
    public async Task<Result<PagedResult<CustomerDto>>> GetPagedAsync(int page, int pageSize, string? search = null)
    {
        var paged = await repository.GetPagedCustomers(page, pageSize, search);
        var dtos = paged.Items.Select(ToDto).ToList();
        return Result.Success(PagedResult<CustomerDto>.Create(dtos, paged.Page, paged.PageSize, paged.TotalCount));
    }

    public async Task<Result<CustomerDto>> GetByIdAsync(int id)
    {
        if (currentUserService.IsInRole(UserRoles.Customer) && currentUserService.GetCustomerId() != id)
            return Result.Failure<CustomerDto>(Error.Forbidden("Customer.Forbidden", "Customers can only view their own profile."));

        var customer = await repository.GetCustomerById(id);
        if (customer == null)
            return Result.Failure<CustomerDto>(Error.NotFound("Customer.NotFound", $"Customer with ID {id} was not found."));

        return Result.Success(ToDto(customer));
    }

    public async Task<Result<CustomerDto>> GetByEmailAsync(string email)
    {
        var customer = await repository.GetCustomerByEmail(email);
        if (customer == null)
            return Result.Failure<CustomerDto>(Error.NotFound("Customer.NotFound", $"Customer with email '{email}' was not found."));

        if (currentUserService.IsInRole(UserRoles.Customer) && currentUserService.GetCustomerId() != customer.Id)
            return Result.Failure<CustomerDto>(Error.Forbidden("Customer.Forbidden", "Customers can only view their own profile."));

        return Result.Success(ToDto(customer));
    }

    public async Task<Result<CustomerDto>> GetByNameAsync(string name)
    {
        var customer = await repository.GetCustomerByName(name);
        if (customer == null)
            return Result.Failure<CustomerDto>(Error.NotFound("Customer.NotFound", $"Customer '{name}' was not found."));

        if (currentUserService.IsInRole(UserRoles.Customer) && currentUserService.GetCustomerId() != customer.Id)
            return Result.Failure<CustomerDto>(Error.Forbidden("Customer.Forbidden", "Customers can only view their own profile."));

        return Result.Success(ToDto(customer));
    }

    public async Task<Result> UpdateAsync(int id, CustomerDto dto)
    {
        if (id != dto.Id)
            return Result.Failure(Error.Validation("Customer.IdMismatch", "Route ID does not match payload ID."));

        if (!currentUserService.IsAdmin() && currentUserService.GetCustomerId() != id)
            return Result.Failure(Error.Forbidden("Customer.Forbidden", "You can only update your own customer profile."));

        var customer = await repository.GetCustomerById(id);
        if (customer == null)
            return Result.Failure(Error.NotFound("Customer.NotFound", $"Customer with ID {id} was not found."));

        customer.Name = dto.Name;
        customer.Email = dto.Email;
        customer.PhoneNumber = dto.PhoneNumber;

        await repository.UpdateCustomer(customer);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id)
    {
        if (!currentUserService.IsAdmin() && currentUserService.GetCustomerId() != id)
            return Result.Failure(Error.Forbidden("Customer.Forbidden", "You can only delete your own customer profile."));

        var customer = await repository.GetCustomerById(id);
        if (customer == null)
            return Result.Failure(Error.NotFound("Customer.NotFound", $"Customer with ID {id} was not found."));

        await repository.DeleteCustomer(customer);
        return Result.Success();
    }

    private static CustomerDto ToDto(Customer customer) => new()
    {
        Id = customer.Id,
        Name = customer.Name,
        Email = customer.Email,
        PhoneNumber = customer.PhoneNumber
    };
}
