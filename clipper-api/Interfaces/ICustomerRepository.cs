using Clipper.Api.Common;
using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface ICustomerRepository
{
    Task<PagedResult<Customer>> GetPagedCustomers(int page, int pageSize, string? search = null);
    Task<IEnumerable<Customer>> GetAllCustomers();
    Task<Customer?> GetCustomerById(int id);
    Task<Customer?> GetCustomerByUserId(string applicationUserId);
    Task<Customer?> GetCustomerByEmail(string email);
    Task<Customer?> GetCustomerByName(string name);
    Task CreateCustomer(Customer customer);
    Task UpdateCustomer(Customer customer);
    Task DeleteCustomer(Customer customer);
}
