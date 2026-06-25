using System;
using System.Text.Json;
using F1Data.Interfaces;
using F1Services.DTOs;
using F1Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace F1Services.Models;

public class WeatherService : IWeatherService
{
    private readonly IWeatherRepository _weather;
    private readonly IMemoryCache _cache;

    public WeatherService(IWeatherRepository weatherRepo, IMemoryCache cache)
    {
        _weather = weatherRepo;
        _cache = cache;
    }

    public async Task<DailyWeatherDto> GetRaceWeekendWeatherAsync(decimal lat, decimal lng, string startDate, string endDate)
    {
        string dailyWeatherCacheKey = $"dailyWeather_{lat:F4}_{lng:F4}_{startDate}_{endDate}";

        return await _cache.GetOrCreateAsync(dailyWeatherCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(120);

                    var weather = await _weather.GetWeatherAsync(lat, lng, startDate, endDate);

                    return MapDailyWeatherDto(weather);
                }) ?? throw new InvalidOperationException($"Weather data was not generated or returned null for key '{dailyWeatherCacheKey}'.");
    }

    public async Task<RaceWeatherDto> GetRaceDayWeatherDetailAsync(decimal lat, decimal lng, string dateTime, string nextDay)
    {
        var date = dateTime.Split("T")[0];
        string raceWeatherCacheKey = $"raceWeather_{lat:F4}_{lng:F4}_{date}";

        return await _cache.GetOrCreateAsync(raceWeatherCacheKey, async (entry) =>
                        {
                            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);

                            var weather = await _weather.GetWeatherAsync(lat, lng, date, nextDay);

                            return MapRaceWeatherDto(weather, dateTime);
                        }) ?? throw new InvalidOperationException($"Weather data was not generated or returned null for key '{raceWeatherCacheKey}'.");
    }

    private DailyWeatherDto MapDailyWeatherDto(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var daily = doc.RootElement.GetProperty("daily");

        return new DailyWeatherDto()
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
    }

    private RaceWeatherDto MapRaceWeatherDto(string weather, string dateTime)
    {
        using var doc = JsonDocument.Parse(weather);

        var hourly = doc.RootElement.GetProperty("hourly");

        var raceStartIndex = hourly.GetProperty("time")
                              .EnumerateArray()
                              .Select(d => d.GetString() ?? "")
                              .ToList()
                              .FindIndex(t => t == dateTime);

        int startHour = Math.Max(0, raceStartIndex - 2);
        int count = 6;

        return new RaceWeatherDto()
        {
            Hour = hourly.GetProperty("time")
                        .EnumerateArray()
                        .Select(d => d.GetString() ?? "")
                        .Skip(startHour)
                        .Take(count)
                        .ToList(),
            Temperature = hourly.GetProperty("temperature_2m")
                        .EnumerateArray()
                        .Select(d => d.GetDouble())
                        .Skip(startHour)
                        .Take(count)
                        .ToList(),
            Precipitation = hourly.GetProperty("precipitation")
                        .EnumerateArray()
                        .Select(d => d.GetDouble())
                        .Skip(startHour)
                        .Take(count)
                        .ToList(),
            PrecipitationProbability = hourly.GetProperty("precipitation_probability")
                        .EnumerateArray()
                        .Select(d => d.GetDouble())
                        .Skip(startHour)
                        .Take(count)
                        .ToList(),
            WindSpeed = hourly.GetProperty("wind_speed_10m")
                        .EnumerateArray()
                        .Select(d => d.GetDouble())
                        .Skip(startHour)
                        .Take(count)
                        .ToList(),
            WindDirection = hourly.GetProperty("wind_direction_10m")
                        .EnumerateArray()
                        .Select(d => d.GetDouble())
                        .Skip(startHour)
                        .Take(count)
                        .ToList()
        };
    }
}
