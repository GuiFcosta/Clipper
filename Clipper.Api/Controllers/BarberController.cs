using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarberController(IBarber repository) : ControllerBase
{
    // GET: api/Barber
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Barber>>> GetAllBarbers()
    {
        var barbers = await repository.GetAllBarbers();
        return Ok(barbers);
    }
    
    // GET: api/Barber/shop/{barberShopId}
    [HttpGet("shop/{barberShopId}")]
    public async Task<ActionResult<IEnumerable<Barber>>> GetAllBarbersFromBarberShop(int barberShopId)
    {
        var barbers = await repository.GetAllBarbersFromBarberShop(barberShopId);
        return Ok(barbers);
    }
    
    // GET: api/Barber/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Barber>> GetBarberById(int id)
    {
        var barber = await repository.GetBarberById(id);
        return Ok(barber);
    }
    
    // POST: api/Barber
    [HttpPost]
    public async Task<ActionResult> CreateBarber([FromBody] Barber barber)
    {
        await repository.CreateBarber(barber);
        return CreatedAtAction(nameof(GetBarberById), new { id = barber.Id }, barber);
    }
    
    // PUT: api/Barber/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBarber(int id, [FromBody] Barber barber)
    {
        if (id != barber.Id)
            return BadRequest();
        await repository.UpdateBarber(barber);
        return NoContent();
    }
    
    // DELETE: api/Barber/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBarber(int id)
    {
        await repository.DeleteBarber(id);
        return NoContent();
    }
}