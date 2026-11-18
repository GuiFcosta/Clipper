using Clipper.Api.Common;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class CustomerRepository(ApplicationDbContext context) : ICustomerRepository
{
    public async Task<PagedResult<Customer>> GetPagedCustomers(int page, int pageSize, string? search = null)
    {
        var query = context.Clients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                c.Email.ToLower().Contains(term) ||
                c.PhoneNumber.Contains(term));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return PagedResult<Customer>.Create(items, page, pageSize, totalCount);
    }

    public async Task<IEnumerable<Customer>> GetAllCustomers()
    {
        return await context.Clients.ToListAsync();
    }

    public async Task<Customer?> GetCustomerById(int id)
    {
        return await context.Clients
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Customer?> GetCustomerByUserId(string applicationUserId)
    {
        return await context.Clients
            .FirstOrDefaultAsync(c => c.ApplicationUserId == applicationUserId);
    }

    public async Task<Customer?> GetCustomerByEmail(string email)
    {
        return await context.Clients
            .FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<Customer?> GetCustomerByName(string name)
    {
        return await context.Clients
            .FirstOrDefaultAsync(c => c.Name == name);
    }

    public async Task CreateCustomer(Customer customer)
    {
        context.Clients.Add(customer);
        await context.SaveChangesAsync();
    }

    public async Task UpdateCustomer(Customer customer)
    {
        context.Clients.Update(customer);
        await context.SaveChangesAsync();
    }

    public async Task DeleteCustomer(Customer customer)
    {
        context.Clients.Remove(customer);
        await context.SaveChangesAsync();
    }
}
