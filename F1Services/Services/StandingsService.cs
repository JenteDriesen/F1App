using System;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text.Json;
using F1Services.DTOs;
using F1Data.Interfaces;
using F1Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace F1Services.Models;

public class StandingsService : IStandingsService
{
    private readonly IErgastApiClient _ergast;
    private readonly IMemoryCache _cache;

    public StandingsService(IErgastApiClient ergast, IMemoryCache cache)
    {
        _ergast = ergast;
        _cache = cache;
    }

    public async Task<List<DriverStandingDto>> GetDriverStandingsAsync(int? year = null, int? race = null)
    {
        int chosenYear = NormalizeYear(year);

        int chosenRound = await DetermineRoundAsync(chosenYear, race);

        string WDCCacheKey = $"driverStandings_{chosenYear}_{chosenRound}";

        return await _cache.GetOrCreateAsync(WDCCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);

                    var url = $"https://api.jolpi.ca/ergast/f1/{chosenYear}/{chosenRound}/driverStandings.json";

                    var json = await _ergast.GetJsonAsync(url);

                    return MapDriverStandings(json);
                }) ?? throw new InvalidOperationException($"Driver standings data was not generated or returned null for key '{WDCCacheKey}'.");
    }

    public async Task<List<ConstructorStandingDto>> GetConstructorStandingsAsync(int? year, int? race)
    {
        int chosenYear = NormalizeYear(year);

        int chosenRound = await DetermineRoundAsync(chosenYear, race);

        string WDCCacheKey = $"constructorStandings_{chosenYear}_{chosenRound}";

        return await _cache.GetOrCreateAsync(WDCCacheKey, async (entry) =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);

                    var url = $"https://api.jolpi.ca/ergast/f1/{chosenYear}/{chosenRound}/constructorStandings.json";

                    var json = await _ergast.GetJsonAsync(url);

                    return MapConstructorStandings(json);
                }) ?? throw new InvalidOperationException($"Constructor standings data was not generated or returned null for key '{WDCCacheKey}'.");
    }

    private static int NormalizeYear(int? year)
    {
        int thisYear = year ?? DateTime.Now.Year;
        return Math.Clamp(thisYear, 1950, DateTime.Now.Year);
    }

    private async Task<int> DetermineRoundAsync(int year, int? race)
    {

        int latestRound = await GetLatestRoundAsync(year);

        if (!race.HasValue || race <= 0 || race > latestRound)
        {
            return latestRound;
        }

        return race.Value;
    }

    private async Task<int> GetLatestRoundAsync(int year)
    {
        string latestRoundCacheKey = $"latestRound_{year}";

        return await _cache.GetOrCreateAsync(latestRoundCacheKey, async (entry) =>
                    {
                        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);

                        var season = await _ergast.GetJsonAsync(
                                        $"https://api.jolpi.ca/ergast/f1/{year}/driverStandings.json");

                        using var doc = JsonDocument.Parse(season);

                        return int.Parse(
                                    doc.RootElement
                                       .GetProperty("MRData")
                                       .GetProperty("StandingsTable")
                                       .GetProperty("round")
                                       .GetString()!);
                    });
    }

    private List<DriverStandingDto> MapDriverStandings(string json)
    {
        using var doc = JsonDocument.Parse(json);

        var standingsList = doc.RootElement
            .GetProperty("MRData")
            .GetProperty("StandingsTable")
            .GetProperty("StandingsLists");

        if (standingsList.GetArrayLength() == 0)
            return new List<DriverStandingDto>();

        return standingsList[0]
            .GetProperty("DriverStandings")
            .EnumerateArray()
            .Select((d, i) => new DriverStandingDto
            {
                Position = i + 1,
                Points = decimal.Parse(d.GetProperty("points").GetString(), CultureInfo.InvariantCulture),
                Wins = int.Parse(d.GetProperty("wins").GetString()),
                DriverId = d.GetProperty("Driver").GetProperty("driverId").GetString(),
                Code = d.GetProperty("Driver").TryGetProperty("code", out var code) ? code.GetString() : null,
                Name = $"{d.GetProperty("Driver").GetProperty("givenName").GetString()} {d.GetProperty("Driver").GetProperty("familyName").GetString()}",
                Nationality = d.GetProperty("Driver").GetProperty("nationality").GetString(),
                Constructor = d.GetProperty("Constructors")[0].GetProperty("name").GetString(),
                ConstructorNationality = d.GetProperty("Constructors")[0].GetProperty("nationality").GetString(),
                WikiUrl = d.GetProperty("Driver").GetProperty("url").GetString()
            })
            .ToList();
    }

    private List<ConstructorStandingDto> MapConstructorStandings(string json)
    {
        using var doc = JsonDocument.Parse(json);

        var standingsList = doc.RootElement
            .GetProperty("MRData")
            .GetProperty("StandingsTable")
            .GetProperty("StandingsLists");

        if (standingsList.GetArrayLength() == 0)
            return new List<ConstructorStandingDto>();

        return standingsList[0]
            .GetProperty("ConstructorStandings")
            .EnumerateArray()
            .Select((c, i) => new ConstructorStandingDto
            {
                Position = i + 1,
                Points = decimal.Parse(c.TryGetProperty("points", out var points) ? points.GetString() : "0", CultureInfo.InvariantCulture),
                Wins = int.Parse(c.TryGetProperty("wins", out var wins) ? wins.GetString() : "0"),
                ConstructorId = c.TryGetProperty("Constructor", out var constructor) ? constructor.TryGetProperty("constructorId", out var constructorId) ? constructorId.GetString() : null : null,
                Name = c.TryGetProperty("Constructor", out var constructor1) ? constructor1.TryGetProperty("name", out var name) ? name.GetString() : null : null,
                Nationality = c.TryGetProperty("Constructor", out var constructor2) ? constructor2.TryGetProperty("nationality", out var nationality) ? nationality.GetString() : null : null,
                WikiUrl = c.TryGetProperty("Constructor", out var constructor3) ? constructor3.TryGetProperty("url", out var url) ? url.GetString() : null : null
            })
            .ToList();
    }
}

