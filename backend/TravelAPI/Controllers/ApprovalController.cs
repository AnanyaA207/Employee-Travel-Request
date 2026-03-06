using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAPI.Data;
using TravelAPI.Models;

namespace TravelAPI.Controllers;

[ApiController]
[Route("api/[controller]")]  // URL: /api/approval
public class ApprovalController : ControllerBase
{
    private readonly AppDbContext _db;

    public ApprovalController(AppDbContext db)
    {
        _db = db;
    }

    // POST /api/approval  — Manager approves or rejects
    [HttpPost]
    public async Task<IActionResult> Decide([FromBody] Approval approval)
    {
        // Save the approval record
        approval.ApprovedAt = DateTime.Now;
        _db.Approvals.Add(approval);

        // Update the travel request status to match the decision
        var request = await _db.TravelRequests.FindAsync(approval.RequestId);
        if (request != null)
        {
            request.Status = approval.Decision; // "Approved" or "Rejected"
        }

        await _db.SaveChangesAsync();
        return Ok(approval);
    }

    // GET /api/approval/request/5  — Get all approvals for a request
    [HttpGet("request/{requestId}")]
    public async Task<IActionResult> GetByRequest(int requestId)
    {
        var approvals = await _db.Approvals
            .Where(a => a.RequestId == requestId)
            .ToListAsync();
        return Ok(approvals);
    }
}