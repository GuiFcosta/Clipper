using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    [HttpPost]
    public ActionResult CreateSchedule()
    {
        // Implement schedule creation logic here
        return Ok("Schedule created successfully.");
    }
}