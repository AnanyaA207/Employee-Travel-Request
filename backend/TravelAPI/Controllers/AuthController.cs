using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAPI.Data;
using TravelAPI.Models;

namespace TravelAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var employee = await _db.Employees
            .FirstOrDefaultAsync(e => e.Email.ToLower() == request.Email.ToLower());

        if (employee == null)
            return Unauthorized("No account found with that email.");

        return Ok(new {
            employee.EmployeeId,
            employee.Name,
            employee.Email,
            employee.Role,
            employee.Department
        });
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Employee employee)
    {
        // Check if email already exists
        bool emailExists = await _db.Employees
            .AnyAsync(e => e.Email.ToLower() == employee.Email.ToLower());

        if (emailExists)
            return BadRequest("An account with this email already exists.");

        employee.CreatedAt = DateTime.Now;
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        return Ok(new {
            employee.EmployeeId,
            employee.Name,
            employee.Email,
            employee.Role,
            employee.Department
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
}