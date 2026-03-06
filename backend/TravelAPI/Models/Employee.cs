using System.ComponentModel.DataAnnotations;
namespace TravelAPI.Models;

public class Employee
{
    [Key]
    public int EmployeeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string Role { get; set; } = "Employee";  // Employee / Manager / Admin
    public int? ManagerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}