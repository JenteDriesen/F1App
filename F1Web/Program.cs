using F1Data.Interfaces;
using F1Data.Models;
using F1Data.Repositories;
using F1Services.Interfaces;
using F1Services.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddControllers();

builder.Services.AddHttpClient<IErgastApiClient, ErgastApiClient>();

builder.Services.AddScoped<IStandingsService, StandingsService>();

builder.Services.AddScoped<IRaceService, RaceService>();
builder.Services.AddScoped<IRaceRepository, RaceRepository>();

builder.Services.AddScoped<IWeatherRepository, WeatherRepository>();
builder.Services.AddScoped<IWeatherService, WeatherService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

