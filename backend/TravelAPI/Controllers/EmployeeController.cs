using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelAPI.Data;
using TravelAPI.Models;

namespace TravelAPI.Controllers;

[ApiController]
[Route("api/[controller]")]  // URL: /api/employee
public class EmployeeController : ControllerBase
{
    private readonly AppDbContext _db;

    public EmployeeController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/employee  — Get all employees
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _db.Employees.ToListAsync();
        return Ok(employees);
    }

    // GET /api/employee/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var emp = await _db.Employees.FindAsync(id);
        if (emp == null) return NotFound();
        return Ok(emp);
    }
}