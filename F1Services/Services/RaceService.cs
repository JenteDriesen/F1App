using System;
using System.Text.Json;
using System.Text.RegularExpressions;
using F1Data.Interfaces;
using F1Data.Models;
using F1Services.DTOs;
using F1Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace F1Services.Models;

public partial class RaceService : IRaceService
{
    private readonly IErgastApiClient _ergast;
    private readonly IRaceRepository _raceRepository;
    private readonly IMemoryCache _cache;

    public RaceService(IErgastApiClient ergast, IRaceRepository raceRepository, IMemoryCache cache)
    {
        _ergast = ergast;
        _raceRepository = raceRepository;
        _cache = cache;
    }

    /* public async Task<RaceWeekend> GetRaceWeekendAsync(int? year = null, int? round = null)
    {
        string raceWeekendCacheKey = $"raceWeekend_{year?.ToString() ?? "current"}_{round.ToString() ?? "last"}";

        return await _cache.GetOrCreateAsync(raceWeekendCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);

                    var raceWeekends = await _raceRepository.GetRaceWeekendsAsync(year);

                    return raceWeekends.FirstOrDefault(r => r.Round == round);
                }) ?? throw new InvalidOperationException($"Race weekend data was not generated or returned null for key '{raceWeekendCacheKey}'.");
    } */

    public async Task<RaceWeekend> GetNextRaceweekendAsync()
    {
        string nextRaceWeekendCacheKey = "nextRaceWeekend";

        return await _cache.GetOrCreateAsync(nextRaceWeekendCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20);

                    var weekends = await _raceRepository.GetRaceWeekendsAsync();

                    return weekends.FirstOrDefault(r =>
                                        r.RaceDateTime > DateTime.UtcNow);

                }) ?? throw new InvalidOperationException($"Next race weekend data was not generated or returned null for key '{nextRaceWeekendCacheKey}'.");
    }

    public async Task<NextSessionAndRaceDto> GetNextSessionAndRaceAsync()
    {
        var nextRace = await GetNextRaceweekendAsync();

        var nextSession = nextRace.Sessions.FirstOrDefault(s =>
                            s.SessionDateTime > DateTime.UtcNow)
                            ?? new Session { Name = "Race", SessionDateTime = nextRace.RaceDateTime };

        return new NextSessionAndRaceDto()
        {
            NextSession = new Session
            {
                Name = FormatSessionName(nextSession.Name),
                SessionDateTime = nextSession.SessionDateTime
            },
            NextRace = new Session
            {
                Name = nextRace.Name,
                SessionDateTime = nextRace.RaceDateTime
            }
        };
    }

    public async Task<RaceWeekendQualifyingResult> GetQualifyingResultsAsync(int? year = null, int? race = null, string? session = "Qualifying")
    {
        string qualifyingResultsCacheKey = $"qualifyingResults_{year?.ToString() ?? "current"}_{race?.ToString() ?? "last"}";

        return await _cache.GetOrCreateAsync(qualifyingResultsCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);

                    return await _raceRepository.GetQualifyingResultsAsync(year, race, session);
                }) ?? throw new InvalidOperationException($"Qualifying results were not generated or returned null for key '{qualifyingResultsCacheKey}'.");
    }

    public async Task<List<RaceResultDto>> GetRaceResultsAsync(int? year = null, int? race = null, string? session = "race")
    {
        string raceResultsCacheKey = $"raceResults_{year?.ToString() ?? "current"}_{race?.ToString() ?? "last"}";

        return await _cache.GetOrCreateAsync(raceResultsCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);

                    var weekendResult = await _raceRepository.GetRaceResultsAsync(year, race, session);

                    return weekendResult.Results.Select(r => new RaceResultDto
                    {
                        Position = r.Position,
                        Driver = $"{r.Driver.GivenName} {r.Driver.FamilyName}",
                        Team = r.Constructor.Name,
                        Time = r.RaceTime,
                        Points = r.Points,
                        FastestLap = !string.IsNullOrEmpty(r.FastestLap)
                    }).ToList();
                }) ?? throw new InvalidOperationException($"Race results were not generated or returned null for key '{raceResultsCacheKey}'.");
    }

    public async Task<List<RaceWeekendDto>> GetCompletedRaceWeekendsAsync(int? year)
    {
        string completedRaceWeekendsCacheKey = $"completedRaceWeekends_{year ?? DateTime.Now.Year}";

        return await _cache.GetOrCreateAsync(completedRaceWeekendsCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);

                    var completedWeekends = await _raceRepository.GetNumberOfCompletedRaceWeekendsAsync(year);

                    var weekends = await _raceRepository.GetRaceWeekendsAsync(year);

                    return weekends
                        .Where(r => r.Round <= completedWeekends)
                        .Select(r =>
                        {
                            var sessions = r.Sessions
                                .Where(s => s.Name is "Qualifying" or "Sprint")
                                .Select(s => s.Name)
                                .ToList();

                            sessions.Add("Race");

                            return new RaceWeekendDto
                            {
                                Name = r.Name,
                                Round = r.Round,
                                Sessions = sessions
                            };
                        })
                        .ToList();
                }) ?? throw new InvalidOperationException($"Completed race weekends data was not generated or returned null for key '{completedRaceWeekendsCacheKey}'.");
    }

    [GeneratedRegex("(\\B[A-Z])")]
    private static partial Regex SplitCamelCase();

    private static string FormatSessionName(string name)
    {
        Dictionary<string, string> sessionNames = new()
        {
             {"FirstPractice", "FP1"},
             {"SecondPractice", "FP2"},
             {"ThirdPractice", "FP3"},
             {"SprintQualifying", "Sprint Qualifying"}
        };

        if (sessionNames.TryGetValue(name, out var mapped))
            return mapped;

        return SplitCamelCase().Replace(name, " $1");
    }
}
