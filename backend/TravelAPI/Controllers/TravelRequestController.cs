using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAPI.Data;
using TravelAPI.Models;
using TravelAPI.Services;

namespace TravelAPI.Controllers;

[ApiController]
[Route("api/[controller]")]  // URL: /api/travelrequest
public class TravelRequestController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TravelCostService _costService;

    public TravelRequestController(AppDbContext db, TravelCostService costService)
    {
        _db = db;
        _costService = costService;
    }

    // GET /api/travelrequest  — Get all requests
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _db.TravelRequests.ToListAsync();
        return Ok(requests);
    }

    // GET /api/travelrequest/5  — Get one request by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var request = await _db.TravelRequests.FindAsync(id);
        if (request == null) return NotFound("Request not found.");
        return Ok(request);
    }

    // GET /api/travelrequest/employee/3  — Get all requests by an employee
    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var requests = await _db.TravelRequests
            .Where(r => r.EmployeeId == employeeId)
            .ToListAsync();
        return Ok(requests);
    }

    // POST /api/travelrequest  — Submit a new request
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] TravelRequest request)
    {
        // Validate dates
        if (request.TravelEndDate < request.TravelStartDate)
            return BadRequest("End date cannot be before start date.");

        // Auto-calculate costs using our service
        var (food, total) = _costService.CalculateTripCost(request);
        request.CalculatedFoodAllowance = food;
        request.CalculatedTotalCost = total;

        // Set initial status
        request.Status = "Pending";
        request.SubmittedAt = DateTime.Now;

        _db.TravelRequests.Add(request);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.RequestId }, request);
    }

    // PUT /api/travelrequest/5/status  — Update status (approve/reject)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        var request = await _db.TravelRequests.FindAsync(id);
        if (request == null) return NotFound();

        request.Status = newStatus;
        await _db.SaveChangesAsync();
        return Ok(request);
    }
    // DELETE /api/travelrequest/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var request = await _db.TravelRequests.FindAsync(id);
        if (request == null) return NotFound();

        // Also delete related approvals and itineraries first
        var approvals = _db.Approvals.Where(a => a.RequestId == id);
        var itineraries = _db.Itineraries.Where(i => i.RequestId == id);

        _db.Approvals.RemoveRange(approvals);
        _db.Itineraries.RemoveRange(itineraries);
        _db.TravelRequests.Remove(request);

        await _db.SaveChangesAsync();
        return Ok("Request deleted.");
    }
}