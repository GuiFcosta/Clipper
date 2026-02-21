using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarberShopController(IBarberShopRepository repository) : ControllerBase
{
    // GET: api/BarberShop
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BarberShop>>> GetAllBarberShops()
    {
        var barberShops = await repository.GetAllBarberShopsAsync();
        return Ok(barberShops);
    }
    // GET: api/BarberShop/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<BarberShop>> GetBarberShopById(int id)
    {
        var barberShop = await repository.GetBarberShopByIdAsync(id);
        return Ok(barberShop);
    }
    // POST: api/BarberShop
    [HttpPost]
    public async Task<ActionResult> CreateBarberShop([FromBody] BarberShop barberShop)
    {
        await repository.CreateBarberShopAsync(barberShop);
        return CreatedAtAction(nameof(GetBarberShopById), new { id = barberShop.Id }, barberShop);
    }
    // PUT: api/BarberShop/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBarberShop(int id, [FromBody] BarberShop barberShop)
    {
        if (id != barberShop.Id)
            return BadRequest();
        await repository.UpdateBarberShopAsync(barberShop);
        return NoContent();
    }
    // DELETE: api/BarberShop/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBarberShop(int id)
    {
        await repository.DeleteBarberShopAsync(id);
        return NoContent();
    }
}