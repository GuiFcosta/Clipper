using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Customer;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController(ICustomerRepository repository) : ControllerBase
{
    // GET: api/customer
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetAllCustomers()
    {
        var customers = await repository.GetAllCustomers();
        var customerDto = customers.Select(c => new CustomerDto
        {
            Id = c.Id,
            Name = c.Name,
            Email = c.Email,
            PhoneNumber = c.PhoneNumber
        });
        return Ok(customerDto);
    }

    // GET: api/customer/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomerById(int id)
    {
        var customer = await repository.GetCustomerById(id);
        if (customer == null)
            return NotFound();
        var customerDto = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber
        };
        return Ok(customerDto);
    }

    // GET: api/customer/email/{email}
    [HttpGet("email/{email}")]
    public async Task<ActionResult<CustomerDto>> GetCustomerByEmail(string email)
    {
        var customer = await repository.GetCustomerByEmail(email);
        if (customer == null)
            return NotFound();
        var customerDto = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber
        };
        return Ok(customerDto);
    }
    
    // GET: api/customer/name?name={name} -> Method with query parameter for name search
    // [HttpGet("name")]
    // public async Task<ActionResult<CustomerReadDto>> GetCustomerByName([FromQuery] string name)
    // {
    //     ... same as above
    // }
    
    // GET: api/customer/name/{name}
    [HttpGet("name/{name}")]
    public async Task<ActionResult<CustomerDto>> GetCustomerByName(string name)
    {
        var customer = await repository.GetCustomerByName(name);
        if (customer == null)
            return NotFound();
        var customerDto = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber
        };
        return Ok(customerDto);
    }
    
    [HttpPost]
    public async Task<ActionResult> CreateCustomer([FromBody] CustomerCreateDto customerCreateDto)
    {
        var customer = new Customer
        {
            Name = customerCreateDto.Name,
            Email = customerCreateDto.Email,
            PhoneNumber = customerCreateDto.PhoneNumber
        };
        await repository.CreateCustomer(customer);
        return CreatedAtAction(nameof(GetCustomerById), new { id = customer.Id }, customer);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerDto customerUpdateDto)
    {
        if (id != customerUpdateDto.Id)
            return BadRequest();
        var customer = await repository.GetCustomerById(id);
        if (customer == null)
            return NotFound();
        customer.Name = customerUpdateDto.Name;
        customer.Email = customerUpdateDto.Email;
        customer.PhoneNumber = customerUpdateDto.PhoneNumber;
        await repository.UpdateCustomer(customer);
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customer = await repository.GetCustomerById(id);
        if (customer == null)
            return NotFound();
        await repository.DeleteCustomer(customer);
        return NoContent();
    }
}