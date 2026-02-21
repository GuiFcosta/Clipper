using Clipper.Api.Models.Entities;

namespace Clipper.Api.Interfaces;

public interface ICustomerRepository
{
    Task<IEnumerable<Customer>> GetAllCustomers();
    Task<Customer> GetCustomerById(int id);
    Task<Customer> GetCustomerByEmail(string email);
    Task<Customer> GetCustomerByUsername(string username);
    Task CreateCustomer(Customer customer);
    Task UpdateCustomer(Customer customer);
    Task DeleteCustomer(Customer customer);
}