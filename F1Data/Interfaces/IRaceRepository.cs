using System;
using F1Data.Models;

namespace F1Data.Interfaces;

public interface IRaceRepository
{
    Task<List<RaceWeekend>> GetRaceWeekendsAsync(int? year = null);
    Task<RaceWeekendQualifyingResult> GetQualifyingResultsAsync(int? year = null, int? race = null, string? session = "Qualifying");
    Task<RaceWeekendRaceResult> GetRaceResultsAsync(int? year = null, int? race = null, string? session = "race");
    Task<int> GetNumberOfCompletedRaceWeekendsAsync(int? year = null);
}
