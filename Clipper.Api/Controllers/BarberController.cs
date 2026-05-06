using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Barber;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarberController(IBarberRepository repository) : ControllerBase
{
    // GET: api/barber
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BarberDto>>> GetAllBarbers()
    {
        var barbers = await repository.GetAllBarbers();
        var response = barbers.Select(barber => new BarberDto
        {
            Id = barber.Id,
            Name = barber.Name,
            Email = barber.Email,
            PhoneNumber = barber.PhoneNumber,
            Nif = barber.Nif,
            Address = barber.Address,
            BarberShopId = barber.BarberShopId
        }).ToList();
        return Ok(response);
    }
    
    // GET: api/barber/shop/{barberShopId}
    [HttpGet("shop/{barberShopId}")]
    public async Task<ActionResult<IEnumerable<BarberDto>>> GetAllBarbersFromBarberShop(int barberShopId)
    {
        var barbers = await repository.GetAllBarbersFromBarberShop(barberShopId);
        var response = barbers.Select(barber => new BarberDto
        {
            Id = barber.Id,
            Name = barber.Name,
            Email = barber.Email,
            PhoneNumber = barber.PhoneNumber,
            Nif = barber.Nif,
            Address = barber.Address,
            BarberShopId = barber.BarberShopId
        }).ToList();
        return Ok(response);
    }
    
    // GET: api/barber/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<BarberDto>> GetBarberById(int id)
    {
        var barber = await repository.GetBarberById(id);
        if (barber == null)
            return NotFound();
        var response = new BarberDto
        {
            Id = barber.Id,
            Name = barber.Name,
            Email = barber.Email,
            PhoneNumber = barber.PhoneNumber,
            Nif = barber.Nif,
            Address = barber.Address,
            BarberShopId = barber.BarberShopId
        };
        return Ok(response);
    }
    
    // POST: api/barber
    [HttpPost]
    public async Task<ActionResult> CreateBarber([FromBody] BarberCreateDto barber)
    {
        var newBarber = new Barber
        {
            Name = barber.Name,
            Email = barber.Email,
            PhoneNumber = barber.PhoneNumber,
            Nif = barber.Nif,
            Address = barber.Address,
            BarberShopId = barber.BarberShopId
        };
        await repository.CreateBarber(newBarber);
        return CreatedAtAction(nameof(GetBarberById), new { id = newBarber.Id }, newBarber);
    }
    
    // PUT: api/barber/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateBarber(int id, [FromBody] BarberDto barber)
    {
        if (id != barber.Id)
            return BadRequest();
        
        var barberToUpdate = await repository.GetBarberById(id);
        if (barberToUpdate == null)
            return NotFound();
        
        barberToUpdate.Name = barber.Name;
        barberToUpdate.Email = barber.Email;
        barberToUpdate.PhoneNumber = barber.PhoneNumber;
        barberToUpdate.Nif = barber.Nif;
        barberToUpdate.Address = barber.Address;
        barberToUpdate.BarberShopId = barber.BarberShopId;
        
        await repository.UpdateBarber(barberToUpdate);
        return NoContent();
    }
    
    // DELETE: api/barber/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBarber(int id)
    {
        await repository.DeleteBarber(id);
        return NoContent();
    }
}