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

        var request = await _db.TravelRequests.FindAsync(approval.RequestId);

        // If manager sends NeedMoreInfo for the first time, set status to NeedMoreInfo
        if (request != null && approval.Decision == "NeedMoreInfo" && request.Status == "Pending")
        {
            request.Status = "NeedMoreInfo";
        }

        // Only update status for actual decisions (Approved or Rejected)
        // EmployeeReply and NeedMoreInfo messages do NOT change the status
        if (request != null &&
            approval.Decision != "EmployeeReply" &&
            approval.Decision != "NeedMoreInfo")
        {
            request.Status = approval.Decision;
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