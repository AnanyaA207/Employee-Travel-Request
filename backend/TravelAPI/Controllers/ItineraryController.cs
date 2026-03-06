using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAPI.Data;
using TravelAPI.Models;

namespace TravelAPI.Controllers;

[ApiController]
[Route("api/[controller]")]  // URL: /api/itinerary
public class ItineraryController : ControllerBase
{
    private readonly AppDbContext _db;

    public ItineraryController(AppDbContext db)
    {
        _db = db;
    }

    // POST /api/itinerary  — Admin adds itinerary
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Itinerary itinerary)
    {
        itinerary.CreatedAt = DateTime.Now;
        _db.Itineraries.Add(itinerary);
        await _db.SaveChangesAsync();
        return Ok(itinerary);
    }

    // GET /api/itinerary/request/5  — Get itinerary for a request
    [HttpGet("request/{requestId}")]
    public async Task<IActionResult> GetByRequest(int requestId)
    {
        var itinerary = await _db.Itineraries
            .FirstOrDefaultAsync(i => i.RequestId == requestId);
        if (itinerary == null) return NotFound("No itinerary found yet.");
        return Ok(itinerary);
    }
}