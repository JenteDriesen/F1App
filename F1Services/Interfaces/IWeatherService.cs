using System;
using F1Services.DTOs;

namespace F1Services.Interfaces;

public interface IWeatherService
{
    Task<DailyWeatherDto> GetRaceWeekendWeatherAsync(decimal lat, decimal lng, string startDate, string endDate);
    Task<RaceWeatherDto> GetRaceDayWeatherDetailAsync(decimal lat, decimal lng, string dateTime, string nextDay);
}
