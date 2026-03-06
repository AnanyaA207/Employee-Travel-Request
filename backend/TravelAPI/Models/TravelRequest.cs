using System.ComponentModel.DataAnnotations;
namespace TravelAPI.Models;

public class TravelRequest
{
    [Key]
    public int RequestId { get; set; }
    public int EmployeeId { get; set; }
    public string Destination { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public DateTime TravelStartDate { get; set; }
    public DateTime TravelEndDate { get; set; }
    public string? TravelMode { get; set; }        // Flight / Train / Car
    public string TravelType { get; set; } = "Domestic"; // Domestic / International
    public bool HotelRequired { get; set; }
    public decimal AdvanceRequired { get; set; }
    public decimal EstimatedExpense { get; set; }

    // Calculated by backend
    public decimal CalculatedFoodAllowance { get; set; }
    public decimal CalculatedTotalCost { get; set; }

    public string Status { get; set; } = "Pending";
    public DateTime SubmittedAt { get; set; } = DateTime.Now;
}