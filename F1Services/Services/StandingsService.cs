using System;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text.Json;
using F1Data.DTOs;
using F1Data.Interfaces;
using F1Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace F1Services.Models;

public class StandingsService : IStandingsService
{
    private readonly IErgastApiClient _ergast;
    public readonly IMemoryCache _cache;

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

        if (_cache.TryGetValue(WDCCacheKey, out List<DriverStandingDto> cached))
        {
            return cached ?? throw new InvalidOperationException($"Driver standings data was not generated or returned null for key '{WDCCacheKey}'.");
        }

        var url = $"https://api.jolpi.ca/ergast/f1/{chosenYear}/{chosenRound}/driverStandings.json";

        var json = await _ergast.GetJsonAsync(url);

        var result = MapDriverStandings(json);

        _cache.Set(WDCCacheKey, result, TimeSpan.FromMinutes(10));

        return result;
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
        //trying with GetOrCreateAsync
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
                Name = $"{d.GetProperty("Driver").GetProperty("givenName").GetString()} {d.GetProperty("Driver").GetProperty("familyName").GetString()}",
                Nationality = d.GetProperty("Driver").GetProperty("nationality").GetString(),
                Constructor = d.GetProperty("Constructors")[0].GetProperty("name").GetString(),
                ConstructorNationality = d.GetProperty("Constructors")[0].GetProperty("nationality").GetString(),
                WikiUrl = d.GetProperty("Driver").GetProperty("url").GetString()
            })
            .ToList();
    }
}

