using TravelAPI.Models;

namespace TravelAPI.Services;

/// <summary>
/// This service contains all the business rules for calculating travel costs.
/// This is the "brain" of your application.
/// </summary>
public class TravelCostService
{
    // ── Constants (Company Policy) ──────────────────────────────────────────

    private const decimal DOMESTIC_FOOD_PER_DAY     = 500m;   // ₹500/day domestic
    private const decimal INTERNATIONAL_FOOD_PER_DAY = 2500m;  // ₹2500/day international
   
    private const decimal HOTEL_DOMESTIC_PER_NIGHT   = 2000m;  // ₹2000/night domestic hotel
    private const decimal HOTEL_INTL_PER_NIGHT       = 8000m;  // ₹8000/night international hotel

    // ── Main calculation method ──────────────────────────────────────────────

    public (decimal foodAllowance, decimal totalCost) CalculateTripCost(TravelRequest request)
    {
        // 1. Calculate number of days
        int days = (request.TravelEndDate - request.TravelStartDate).Days + 1;
        if (days < 1) days = 1;

        // 2. Calculate food allowance based on travel type
        decimal foodAllowance = request.TravelType == "International"
            ? INTERNATIONAL_FOOD_PER_DAY * days
            : DOMESTIC_FOOD_PER_DAY * days;

        // 3. Calculate hotel cost if required
        decimal hotelCost = 0;
        if (request.HotelRequired)
        {
            decimal ratePerNight = request.TravelType == "International"
                ? HOTEL_INTL_PER_NIGHT
                : HOTEL_DOMESTIC_PER_NIGHT;
            hotelCost = ratePerNight * (days - 1); // Nights = days - 1
        }

        // 4. Use employee's estimated expense as the travel cost
        //    (In a real app, you might calculate distance * rate for car travel)
        decimal travelCost = request.EstimatedExpense;

        // 5. Total = Food + Hotel + Travel + Miscellaneous (10% buffer)
        decimal subtotal = foodAllowance + hotelCost + travelCost;
        decimal totalCost = subtotal;

        return (Math.Round(foodAllowance, 2), Math.Round(totalCost, 2));
    }

    // ── Helper: Distance reimbursement for personal vehicle ─────────────────

   
}