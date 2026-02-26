using System;
using System.Globalization;
using F1Data.Interfaces;

namespace F1Data.Repositories;

public class WeatherRepository : IWeatherRepository
{
    private readonly HttpClient _httpClient;

    public WeatherRepository(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public Task<string> GetWeatherAsync(decimal lat, decimal lng, string startDate, string endDate)
    {
        var url = $"https://api.open-meteo.com/v1/forecast?" +
                  $"latitude={lat.ToString(CultureInfo.InvariantCulture)}&longitude={lng.ToString(CultureInfo.InvariantCulture)}" +
                  $"&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_probability_max,precipitation_hours&hourly=temperature_2m,rain,showers,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m" +
                  $"&start_date={startDate}&end_date={endDate}";

        Console.WriteLine($"{url}");


        return _httpClient.GetStringAsync(url);
    }
}
