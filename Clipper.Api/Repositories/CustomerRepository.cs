using Clipper.Api.Constants;
using Clipper.Api.Data;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Repositories;

public class CustomerRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager) : ICustomerRepository
{
    public async Task<IEnumerable<Customer>> GetAllCustomers()
    {
        return await context.Clients.ToListAsync();
    }
    public async Task<Customer?> GetCustomerById(int id)
    {
        return await context.Clients
            .FirstOrDefaultAsync(c => c.Id == id);
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
        var applicationUser = new ApplicationUser
        {
            FullName = customer.Name,
            UserName = customer.Email,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber
        };
        await userManager.CreateAsync(applicationUser);
        await userManager.AddToRoleAsync(applicationUser, UserRoles.Customer);
        customer.ApplicationUserId = applicationUser.Id;
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