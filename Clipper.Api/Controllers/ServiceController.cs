using Clipper.Api.Interfaces;
using Clipper.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/service")]
public class ServiceController(IServiceRepository repository) : ControllerBase
{
    // GET: api/service
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Service>>> GetAllServices()
    {
        var services = await repository.GetAllServices();
        return Ok(services);
    }

    // GET: api/service/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Service>> GetServiceById(int id)
    {
        var service = await repository.GetServiceById(id);
        if (service == null)
            return NotFound();
        return Ok(service);
    }

    // POST: api/service
    [HttpPost]
    public async Task<ActionResult> CreateService([FromBody] Service service)
    {
        await repository.CreateService(service);
        return CreatedAtAction(nameof(GetServiceById), new { id = service.Id }, service);
    }

    // PUT: api/service/{id} 
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] Service service)
    {
        if (id != service.Id)
            return BadRequest();
        await repository.UpdateService(service);
        return NoContent();
    }

    // DELETE: api/service/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        await repository.DeleteService(id);
        return NoContent();
    }
}