using System;
using System.Text.Json;
using F1Data.Interfaces;
using F1Services.DTOs;
using F1Services.Interfaces;

namespace F1Services.Models;

public class WeatherService : IWeatherService
{
    private readonly IWeatherRepository _weather;

    public WeatherService(IWeatherRepository weatherRepo)
    {
        _weather = weatherRepo;
    }

    public async Task<DailyWeatherDto> GetRaceWeekendWeatherAsync(decimal lat, decimal lng, string startDate, string endDate)
    {
        var weather = await _weather.GetWeatherAsync(lat, lng, startDate, endDate);

        using var doc = JsonDocument.Parse(weather);

        var daily = doc.RootElement.GetProperty("daily");

        DailyWeatherDto dailyWeatherDto = new()
        {
            Date = daily.GetProperty("time")
                         .EnumerateArray()
                         .Select(d => d.GetString() ?? "")
                         .ToList(),
            TemperatureMax = daily.GetProperty("temperature_2m_max")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            TemperatureMin = daily.GetProperty("temperature_2m_min")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            PrecipitationSum = daily.GetProperty("precipitation_sum")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            PrecipitationProbabilityMax = daily.GetProperty("precipitation_probability_max")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            PrecipitationHours = daily.GetProperty("precipitation_hours")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            WindSpeedMax = daily.GetProperty("wind_speed_10m_max")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            WindDirectionDominant = daily.GetProperty("wind_direction_10m_dominant")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList()
        };

        return dailyWeatherDto;
    }

    public async Task<RaceWeatherDto> GetRaceDayWeatherDetailAsync(decimal lat, decimal lng, string dateTime, string nextDay)
    {
        var date = dateTime.Split("T")[0];

        var weather = await _weather.GetWeatherAsync(lat, lng, date, nextDay);

        using var doc = JsonDocument.Parse(weather);

        var hourly = doc.RootElement.GetProperty("hourly");

        Console.WriteLine($"{dateTime}");

        Console.WriteLine($"|||||| {hourly.GetProperty("time")
                .EnumerateArray()
                .Where(d => d.GetString() == dateTime)
                .GetEnumerator()} ||||||");

        var raceIndex = hourly.GetProperty("time")
                              .EnumerateArray()
                              .Select(d => d.GetString() ?? "")
                              .ToList()
                              .FindIndex(t => t == dateTime);

        RaceWeatherDto raceWeatherDto = new()
        {
            Hour = hourly.GetProperty("time")
                         .EnumerateArray()
                         .Select(d => d.GetString() ?? "")

                         .ToList(),
            Temperature = hourly.GetProperty("temperature_2m")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            Precipitation = hourly.GetProperty("precipitation")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            PrecipitationProbability = hourly.GetProperty("precipitation_probability")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            WindSpeed = hourly.GetProperty("wind_speed_10m")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList(),
            WindDirection = hourly.GetProperty("wind_direction_10m")
                         .EnumerateArray()
                         .Select(d => d.GetDouble())
                         .ToList()
        };

        return raceWeatherDto;
    }



}
