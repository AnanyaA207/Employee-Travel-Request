using Microsoft.EntityFrameworkCore;
using TravelAPI.Models;

namespace TravelAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Each DbSet = one database table
    public DbSet<Employee> Employees { get; set; }
    public DbSet<TravelRequest> TravelRequests { get; set; }
    public DbSet<Approval> Approvals { get; set; }
    public DbSet<Itinerary> Itineraries { get; set; }
}