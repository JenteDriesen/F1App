using System;
using System.Globalization;
using System.Text.Json;
using F1Data.Interfaces;
using F1Data.Models;

namespace F1Data.Repositories;

public class RaceRepository : IRaceRepository
{
    private readonly IErgastApiClient _ergast;

    public RaceRepository(IErgastApiClient ergast)
    {
        _ergast = ergast;
    }

    public async Task<List<RaceWeekend>> GetRaceWeekendsAsync(int? year = null)
    {
        var calendar = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/{(year == null ? "current" : year)}.json");

        using var doc = JsonDocument.Parse(calendar);

        var races = doc.RootElement
            .GetProperty("MRData")
            .GetProperty("RaceTable")
            .GetProperty("Races")
            .EnumerateArray();

        var now = DateTime.UtcNow;
        List<RaceWeekend> weekends = [];

        foreach (var race in races)
        {
            var circuit = race.GetProperty("Circuit");
            var location = circuit.GetProperty("Location");

            var orderedSessions = race.EnumerateObject()
                .Where(p =>
                    p.Name.EndsWith("Practice", StringComparison.OrdinalIgnoreCase) ||
                    p.Name.Equals("Qualifying", StringComparison.OrdinalIgnoreCase) ||
                    p.Name.Contains("Sprint", StringComparison.OrdinalIgnoreCase)
                    )
                .Select(p => new Session
                {
                    Name = p.Name,
                    SessionDateTime = DateTimeOffset.Parse($"{p.Value.GetProperty("date").GetString()}T{p.Value.GetProperty("time").GetString()}").UtcDateTime
                })
                .OrderBy(s => s.SessionDateTime)
                .ToList();

            weekends.Add(new RaceWeekend
            {
                Season = int.TryParse(race.GetProperty("season").GetString(), out var season) ? season : 0,
                Round = int.TryParse(race.GetProperty("round").GetString(), out var round) ? round : 0,
                Name = race.GetProperty("raceName").GetString() ?? "unknown",
                Circuit = new Circuit
                {
                    Id = circuit.GetProperty("circuitId").GetString() ?? "unknown",
                    Name = circuit.GetProperty("circuitName").GetString() ?? "unknown",
                    Location = new Location
                    {
                        Latitude = decimal.TryParse(location.GetProperty("lat").GetString(), CultureInfo.InvariantCulture, out var lat) ? lat : 0m,
                        Longitude = decimal.TryParse(location.GetProperty("long").GetString(), CultureInfo.InvariantCulture, out var lng) ? lng : 0m,
                        Locality = location.GetProperty("locality").GetString() ?? "unknown",
                        Country = location.GetProperty("country").GetString() ?? "unknown"
                    }
                },
                RaceDateTime = DateTimeOffset.Parse($"{race.GetProperty("date").GetString()}T{race.GetProperty("time").GetString()}").UtcDateTime,
                Sessions = orderedSessions
            });
        }

        return weekends;
    }

    public async Task<RaceWeekendRaceResult> GetRaceResultsAsync(int? year = null, int? race = null, string? session = "race")
    {
        var sessionUpperFirst = session.First().ToString().ToUpper() + session[1..];

        var results = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/{year.ToString() ?? "current"}/{race.ToString() ?? "last"}/{(session == "race" ? "results" : session)}.json");

        using var doc = JsonDocument.Parse(results);

        var raceWeekend = doc.RootElement
                            .GetProperty("MRData")
                            .GetProperty("RaceTable")
                            .GetProperty("Races")
                            .EnumerateArray()
                            .First();

        var raceResultJson = raceWeekend
                                .GetProperty($"{(session == "race" ? string.Empty : sessionUpperFirst)}Results")
                                .EnumerateArray();

        var raceResults = new List<RaceResult>();

        foreach (var result in raceResultJson)
        {
            var driver = result.GetProperty("Driver");
            var constructor = result.GetProperty("Constructor");

            raceResults.Add(new RaceResult
            {
                Position = int.Parse(result.GetProperty("position").GetString() ?? "0"),
                Driver = new Driver
                {
                    DriverId = driver.GetProperty("driverId").GetString() ?? "unknown",
                    RaceNumber = int.Parse(driver.GetProperty("permanentNumber").GetString() ?? result.GetProperty("number").GetString() ?? "0"),
                    Code = driver.GetProperty("code").GetString() ?? "unknown",
                    GivenName = driver.GetProperty("givenName").GetString() ?? "unknown",
                    FamilyName = driver.GetProperty("familyName").GetString() ?? "unknown",
                    DateOfBirth = DateOnly.Parse(driver.GetProperty("dateOfBirth").GetString()),
                    Nationality = driver.GetProperty("nationality").GetString() ?? "unknown",
                    Wikipedia = driver.GetProperty("url").GetString() ?? "unknown",
                },
                Constructor = new Constructor
                {
                    ConstructorId = constructor.GetProperty("constructorId").GetString() ?? "unknown",
                    Name = constructor.GetProperty("name").GetString() ?? "unknown",
                    Nationality = constructor.GetProperty("nationality").GetString() ?? "unknown",
                    Wikipedia = constructor.GetProperty("url").GetString() ?? "unknown",
                },
                Status = result.GetProperty("status").GetString() ?? "unknown",
                RaceTime = result.TryGetProperty("Time", out var raceTime)
                           ? raceTime.GetProperty("time").GetString() ?? "unknown"
                           : string.Empty,
                FastestLap = result.TryGetProperty("FastestLap", out var fastestLap)
                             ? fastestLap.GetProperty("Time").GetProperty("time").GetString() ?? "unknown"
                             : string.Empty
            });
        }

        RaceWeekendRaceResult weekendRaceResult = new()
        {
            Season = int.Parse(raceWeekend.GetProperty("season").GetString()),
            Round = int.Parse(raceWeekend.GetProperty("round").GetString()),
            Name = raceWeekend.GetProperty("raceName").GetString() ?? "unknown",
            Results = raceResults
        };

        return weekendRaceResult;
    }

    public async Task<RaceWeekendQualifyingResult> GetQualifyingResultsAsync(int? year = null, int? race = null, string? session = "Qualifying")
    {
        //right now eregast only does normal qualifying, not sprint qualifying, but i want to be flexible for the future
        var sessionUpperFirst = session.First().ToString().ToUpper() + session[1..];

        var results = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/{year.ToString() ?? "current"}/{race.ToString() ?? "last"}/{session}.json");

        using var doc = JsonDocument.Parse(results);

        var raceWeekend = doc.RootElement
                    .GetProperty("MRData")
                    .GetProperty("RaceTable")
                    .GetProperty("Races")
                    .EnumerateArray()
                    .First();

        var qualiResultJson = raceWeekend.GetProperty($"{sessionUpperFirst}Results")
                                         .EnumerateArray();

        var qualiResult = new List<QualifyingResult>();

        foreach (var result in qualiResultJson)
        {
            var driver = result.GetProperty("Driver");
            var constructor = result.GetProperty("Constructor");

            qualiResult.Add(new QualifyingResult
            {
                Position = int.Parse(result.GetProperty("position").GetString() ?? "0"),
                Driver = new Driver
                {
                    DriverId = driver.GetProperty("driverId").GetString() ?? "unknown",
                    RaceNumber = int.Parse(driver.GetProperty("permanentNumber").GetString() ?? result.GetProperty("number").GetString() ?? "0"),
                    Code = driver.GetProperty("code").GetString() ?? "unknown",
                    GivenName = driver.GetProperty("givenName").GetString() ?? "unknown",
                    FamilyName = driver.GetProperty("familyName").GetString() ?? "unknown",
                    DateOfBirth = DateOnly.Parse(driver.GetProperty("dateOfBirth").GetString()),
                    Nationality = driver.GetProperty("nationality").GetString() ?? "unknown",
                    Wikipedia = driver.GetProperty("url").GetString() ?? "unknown",
                },
                Constructor = new Constructor
                {
                    ConstructorId = constructor.GetProperty("constructorId").GetString() ?? "unknown",
                    Name = constructor.GetProperty("name").GetString() ?? "unknown",
                    Nationality = constructor.GetProperty("nationality").GetString() ?? "unknown",
                    Wikipedia = constructor.GetProperty("url").GetString() ?? "unknown",
                },
                Q1 = result.TryGetProperty("Q1", out var q1)
                           ? q1.GetString() ?? "No time set"
                           : string.Empty,
                Q2 = result.TryGetProperty("Q2", out var q2)
                           ? q2.GetString() ?? "No time set"
                           : string.Empty,
                Q3 = result.TryGetProperty("Q3", out var q3)
                           ? q3.GetString() ?? "No time set"
                           : string.Empty
            });
        }

        RaceWeekendQualifyingResult weekendQualiResult = new()
        {
            Season = int.Parse(raceWeekend.GetProperty("season").GetString()),
            Round = int.Parse(raceWeekend.GetProperty("round").GetString()),
            Name = raceWeekend.GetProperty("raceName").GetString() ?? "unknown",
            Results = qualiResult
        };
        return weekendQualiResult;
    }


    public async Task<int> GetNumberOfCompletedRaceWeekendsAsync(int? year = null)
    {

        var results = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/{year.ToString() ?? "current"}/last/results.json");

        Console.WriteLine($"{results} ||||///////||");


        using var doc = JsonDocument.Parse(results);

        var lastRound = doc.RootElement
                            .GetProperty("MRData")
                            .GetProperty("RaceTable")
                            .GetProperty("Races")
                            .EnumerateArray()
                            .First()
                            .GetProperty("round")
                            .GetString();

        return int.Parse(lastRound);
    }
}