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
                .Select((d, i) =>
                {
                    var driver = d.TryGetProperty("Driver", out var driverEl) ? driverEl : default;
                    var constructor = d.TryGetProperty("Constructors", out var constructors)
                                    && constructors.GetArrayLength() > 0
                                    ? constructors[0] : default;

                    return new DriverStandingDto
                    {
                        Position = i + 1,

                        Points = d.TryGetProperty("points", out var points) &&
                                 decimal.TryParse(points.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedPoints)
                                ? parsedPoints : 0,

                        Wins = d.TryGetProperty("wins", out var wins) &&
                               int.TryParse(wins.GetString(), out var parsedWins)
                                ? parsedWins : 0,

                        DriverId = driver.TryGetProperty("driverId", out var driverId)
                                ? driverId.GetString() ?? "unknown" : "unknown",

                        Name = driver.ValueKind != JsonValueKind.Undefined
                                ? $"{(driver.TryGetProperty("givenName", out var given) ? given.GetString() : "")} {(driver.TryGetProperty("familyName", out var family) ? family.GetString() : "")}".Trim()
                                : "unknown",

                        Nationality = driver.TryGetProperty("nationality", out var driverNat)
                                ? driverNat.GetString() ?? "unknown" : "unknown",

                        Constructor = constructor.TryGetProperty("name", out var constructorName)
                                ? constructorName.GetString() ?? "unknown" : "unknown",

                        ConstructorNationality = constructor.TryGetProperty("nationality", out var constructorNat)
                                ? constructorNat.GetString() ?? "unknown" : "unknown",

                        WikiUrl = driver.TryGetProperty("url", out var wikiUrl)
                                ? wikiUrl.GetString() ?? "unknown" : "unknown"
                    };
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
            .Select((c, i) =>
            {
                var constructor = c.TryGetProperty("Constructor", out var team) ? team : default;

                return new ConstructorStandingDto
                {
                    Position = i + 1,
                    Points = c.TryGetProperty("points", out var points) &&
                            decimal.TryParse(points.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedPoints)
                            ? parsedPoints : 0,
                    Wins = int.TryParse(c.TryGetProperty("wins", out var wins) ? wins.GetString() : "0", out var parsedWins)
                            ? parsedWins : 0,
                    ConstructorId = constructor.TryGetProperty("constructorId", out var constructorId)
                            ? constructorId.GetString() ?? "unknown" : "unknown",
                    Name = constructor.TryGetProperty("name", out var name)
                            ? name.GetString() ?? "unknown" : "unknown",
                    Nationality = constructor.TryGetProperty("nationality", out var nationality)
                            ? nationality.GetString() ?? "unknown" : "unknown",
                    WikiUrl = constructor.TryGetProperty("url", out var url)
                            ? url.GetString() ?? "unknown" : "unknown"
                };
            })
            .ToList();
    }
}


