using System;
using F1Services.DTOs;

namespace F1Services.Interfaces;

public interface IStandingsService
{
    Task<List<DriverStandingDto>> GetDriverStandingsAsync(int? year, int? race);
    Task<List<ConstructorStandingDto>> GetConstructorStandingsAsync(int? year, int? race);
}
