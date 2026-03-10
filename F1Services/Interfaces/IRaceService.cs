using System;
using F1Data.Models;
using F1Services.DTOs;

namespace F1Services.Interfaces;

public interface IRaceService
{
    Task<NextSessionAndRaceDto> GetNextSessionAndRaceAsync();
    Task<RaceWeekend> GetNextRaceweekendAsync();
    Task<RaceWeekendQualifyingResult> GetQualifyingResultsAsync(int? year, int? race, string? session);
    Task<RaceWeekendRaceResult> GetRaceResultsAsync(int? year, int? race, string? session);
    Task<List<RaceWeekendDto>> GetCompletedRaceWeekendsAsync(int? year);
}
