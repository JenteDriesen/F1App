using System;
using F1Data.Models;

namespace F1Data.Interfaces;

public interface IRaceRepository
{
    Task<List<RaceWeekend>> GetRaceWeekendsAsync(int? year = null);
    Task<RaceWeekendRaceResult> GetRaceResultsAsync(int? year = null, int? race = null, string? session = "race");
    Task<RaceWeekendQualifyingResult> GetQualifyingResultsAsync(int? year = null, int? race = null, string? session = "Qualifying");
    Task<int> GetNumberOfCompletedRaceWeekendsAsync(int? year = null);
}
