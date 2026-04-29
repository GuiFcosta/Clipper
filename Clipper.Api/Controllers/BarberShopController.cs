using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.BarberShopDto;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarberShopController(IBarberShopRepository repository) : ControllerBase
{
    // GET: api/barbershop
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BarberShop>>> GetAllBarberShops()
    {
        var barberShops = await repository.GetAllBarberShops();
        
        var bsList = barberShops.Select(barberShop => new BarberShopDto
        {
            Id = barberShop.Id,
            Name = barberShop.Name,
            Address = barberShop.Address,
            PhoneNumber = barberShop.PhoneNumber,
            Email = barberShop.Email,
            BarbersIds = barberShop.Barbers?.Select(b => b.Id).ToList()
        }).ToList();
        
        return Ok(bsList);
    }
    // GET: api/barbershop/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<BarberShop>> GetBarberShopById(int id)
    {
        var barberShop = await repository.GetBarberShopById(id);
        
        if(barberShop == null)
            return NotFound();
        
        var bsDto = new BarberShopDto
        {
            Id = barberShop.Id,
            Name = barberShop.Name,
            Address = barberShop.Address,
            PhoneNumber = barberShop.PhoneNumber,
            Email = barberShop.Email,
            BarbersIds = barberShop.Barbers?.Select(b => b.Id).ToList()
        };
        
        return Ok(bsDto);
    }
    // POST: api/barbershop
    [HttpPost]
    public async Task<ActionResult> CreateBarberShop([FromBody] BsCreateDto bsCreateDto)
    {
        var barberShop = new BarberShop
        {
            Name = bsCreateDto.Name,
            Address = bsCreateDto.Address,
            PhoneNumber = bsCreateDto.PhoneNumber,
            Email = bsCreateDto.Email
        };
        await repository.CreateBarberShop(barberShop);
        return CreatedAtAction(nameof(GetBarberShopById), new { id = barberShop.Id }, barberShop);
    }
    // PUT: api/barbershop/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateBarberShop(int id, [FromBody] BarberShopDto bsUpdateDto)
    {
        if (id != bsUpdateDto.Id)
            return BadRequest();
        
        var barberShop = await repository.GetBarberShopById(id);
        if (barberShop == null)
            return NotFound();
        
        barberShop.Name = bsUpdateDto.Name;
        barberShop.Address = bsUpdateDto.Address;
        barberShop.PhoneNumber = bsUpdateDto.PhoneNumber;
        barberShop.Email = bsUpdateDto.Email;
        
        await repository.UpdateBarberShop(barberShop);
        return NoContent();
    }
    // DELETE: api/barbershop/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBarberShop(int id)
    {
        await repository.DeleteBarberShop(id);
        return NoContent();
    }
}