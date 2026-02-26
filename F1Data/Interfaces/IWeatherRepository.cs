using System;

namespace F1Data.Interfaces;

public interface IWeatherRepository
{
    Task<string> GetWeatherAsync(decimal lat, decimal lng, string startDate, string endDate);
}
