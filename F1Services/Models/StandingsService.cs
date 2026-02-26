using System;
using System.Runtime.InteropServices;
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
        int chosenYear = year ?? DateTime.Now.Year;
        int thisYear = DateTime.Now.Year;

        if (chosenYear > thisYear)
            chosenYear = thisYear;
        if (chosenYear < 1950)
            chosenYear = 1950;

        var season = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/{chosenYear}/driverStandings.json");

        using var doc = JsonDocument.Parse(season);

        var lastRace = doc.RootElement
                          .GetProperty("MRData")
                          .GetProperty("StandingsTable")
                          .GetProperty("round")
                          .GetString()!;

        int lastRaceInt = lastRace != null
                        ? int.Parse(lastRace)
                        : 0;

        //if race is out of bounds, default to last race
        if (!race.HasValue || race <= 0 || race > lastRaceInt)
        {
            race = lastRaceInt;
        }

        var url = (year.HasValue && race.HasValue)
            ? $"https://api.jolpi.ca/ergast/f1/{chosenYear}/{race}/driverStandings.json"
            : year.HasValue
            ? $"https://api.jolpi.ca/ergast/f1/{chosenYear}/driverStandings.json"
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

