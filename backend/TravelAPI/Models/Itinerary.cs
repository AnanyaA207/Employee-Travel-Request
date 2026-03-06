using System.ComponentModel.DataAnnotations;
namespace TravelAPI.Models;

public class Itinerary
{
    [Key]
    public int ItineraryId { get; set; }
    public int RequestId { get; set; }
    public string? FlightDetails { get; set; }
    public string? HotelName { get; set; }
    public DateTime? HotelCheckIn { get; set; }
    public DateTime? HotelCheckOut { get; set; }
    public string? LocalTransport { get; set; }
    public string? MeetingSchedule { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}