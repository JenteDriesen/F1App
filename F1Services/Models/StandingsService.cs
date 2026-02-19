using System;
using System.Text.Json;
using F1Data.DTOs;
using F1Data.Interfaces;
using F1Services.Interfaces;

namespace F1Services.Models;

public class StandingsService : IStandingsService
{
    private readonly IErgastApiClient _ergast;

    public StandingsService(IErgastApiClient ergast)
    {
        _ergast = ergast;
    }

    public async Task<List<DriverStandingDto>> GetDriverStandingsAsync(int? year = null, int? race = null)
    {
        var url = (year.HasValue && race.HasValue)
            ? $"https://api.jolpi.ca/ergast/f1/{year}/{race}/driverStandings.json"
            : year.HasValue
            ? $"https://api.jolpi.ca/ergast/f1/{year}/driverStandings.json"
            : race.HasValue
            ? $"https://api.jolpi.ca/ergast/f1/current/{race}/driverStandings.json"
            : "https://api.jolpi.ca/ergast/f1/current/driverStandings.json";

        var json = await _ergast.GetJsonAsync(url);

        return MapDriverStandings(json);
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
                Points = int.Parse(d.GetProperty("points").GetString()),
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

