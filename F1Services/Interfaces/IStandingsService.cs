using System;
using F1Data.DTOs;

namespace F1Services.Interfaces;

public interface IStandingsService
{
    Task<List<DriverStandingDto>> GetDriverStandingsAsync(int? year, int? race);
}
