using System.ComponentModel.DataAnnotations;
namespace TravelAPI.Models;

public class Approval
{
    [Key]
    public int ApprovalId { get; set; }
    public int RequestId { get; set; }
    public int ApproverId { get; set; }
    public string Decision { get; set; } = string.Empty; // Approved / Rejected / NeedMoreInfo
    public string? Comments { get; set; }
    public DateTime ApprovedAt { get; set; } = DateTime.Now;
}