using Microsoft.EntityFrameworkCore;
using TravelAPI.Data;
using TravelAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Register Services ─────────────────────────────────────────────────────

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Our custom cost calculation service
builder.Services.AddSingleton<TravelCostService>();

// API controllers
builder.Services.AddControllers();

// Swagger (API documentation/testing UI)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — allows the React app to call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5093")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();  // Open http://localhost:5000/swagger to test your API
}

app.UseCors("AllowReact");
app.MapControllers();
app.Run();