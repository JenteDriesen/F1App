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
                .Select(p =>
                {
                    var date = p.Value.TryGetProperty("date", out var d) ? d.GetString() : null;
                    var time = p.Value.TryGetProperty("time", out var t) ? t.GetString() : "00:00:00Z";

                    return new Session
                    {
                        Name = p.Name,
                        SessionDateTime = DateTimeOffset.Parse($"{date}T{time}").UtcDateTime
                    };
                })
                .OrderBy(s => s.SessionDateTime)
                .ToList();


            if (race.TryGetProperty("round", out var round))
                weekends.Add(new RaceWeekend
                {
                    Season = int.TryParse(race.GetProperty("season").GetString(), out var season) ? season : 0,
                    Round = int.Parse(round.ToString()),
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
        session ??= "race";
        var sessionUpperFirst = char.ToUpper(session[0]) + session[1..];

        var url = $"https://api.jolpi.ca/ergast/f1/{year?.ToString() ?? "current"}/{race?.ToString() ?? "last"}/{(session == "race" ? "results" : session)}.json";
        var results = await _ergast.GetJsonAsync(url);

        using var doc = JsonDocument.Parse(results);

        var raceWeekend = doc.RootElement
            .GetProperty("MRData")
            .GetProperty("RaceTable")
            .GetProperty("Races")
            .EnumerateArray()
            .FirstOrDefault();

        if (raceWeekend.ValueKind == JsonValueKind.Undefined)
            return new RaceWeekendRaceResult { Season = 0, Round = 0, Name = "unknown", Results = [] };

        var resultsKey = session == "race" ? "Results" : $"{sessionUpperFirst}Results";

        if (!raceWeekend.TryGetProperty(resultsKey, out var resultsElement))
            return new RaceWeekendRaceResult { Season = 0, Round = 0, Name = "unknown", Results = [] };

        var raceResults = new List<RaceResult>();

        foreach (var result in resultsElement.EnumerateArray())
        {
            result.TryGetProperty("Driver", out var driver);
            result.TryGetProperty("Constructor", out var constructor);

            raceResults.Add(new RaceResult
            {
                Position = result.TryGetProperty("position", out var pos)
                    ? int.Parse(pos.GetString() ?? "0")
                    : 0,

                Driver = new Driver
                {
                    DriverId = driver.TryGetProperty("driverId", out var driverId)
                        ? driverId.GetString() ?? "unknown" : "unknown",

                    RaceNumber = driver.TryGetProperty("permanentNumber", out var permNum)
                        ? int.Parse(permNum.GetString() ?? "0")
                        : result.TryGetProperty("number", out var num)
                            ? int.Parse(num.GetString() ?? "0")
                            : 0,

                    Code = driver.TryGetProperty("code", out var code)
                        ? code.GetString() ?? "unknown" : "unknown",

                    GivenName = driver.TryGetProperty("givenName", out var givenName)
                        ? givenName.GetString() ?? "unknown" : "unknown",

                    FamilyName = driver.TryGetProperty("familyName", out var familyName)
                        ? familyName.GetString() ?? "unknown" : "unknown",

                    DateOfBirth = driver.TryGetProperty("dateOfBirth", out var dob) && DateOnly.TryParse(dob.GetString(), out var parsedDob)
                        ? parsedDob : DateOnly.MinValue,

                    Nationality = driver.TryGetProperty("nationality", out var driverNat)
                        ? driverNat.GetString() ?? "unknown" : "unknown",

                    Wikipedia = driver.TryGetProperty("url", out var driverUrl)
                        ? driverUrl.GetString() ?? "unknown" : "unknown",
                },

                Constructor = new Constructor
                {
                    ConstructorId = constructor.TryGetProperty("constructorId", out var constructorId)
                        ? constructorId.GetString() ?? "unknown" : "unknown",

                    Name = constructor.TryGetProperty("name", out var constructorName)
                        ? constructorName.GetString() ?? "unknown" : "unknown",

                    Nationality = constructor.TryGetProperty("nationality", out var constructorNat)
                        ? constructorNat.GetString() ?? "unknown" : "unknown",

                    Wikipedia = constructor.TryGetProperty("url", out var constructorUrl)
                        ? constructorUrl.GetString() ?? "unknown" : "unknown",
                },

                Status = result.TryGetProperty("status", out var status)
                    ? status.GetString() ?? "unknown" : "unknown",

                RaceTime = result.TryGetProperty("Time", out var raceTime) &&
                           raceTime.TryGetProperty("time", out var raceTimeProp)
                    ? raceTimeProp.GetString() ?? string.Empty : string.Empty,

                Points = result.TryGetProperty("points", out var points) &&
                         decimal.TryParse(points.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedPoints)
                    ? parsedPoints : 0,

                FastestLapTime = result.TryGetProperty("FastestLap", out var fastestLap) &&
                                 fastestLap.TryGetProperty("Time", out var lapTime) &&
                                 lapTime.TryGetProperty("time", out var lapTimeProp)
                    ? lapTimeProp.GetString() ?? string.Empty : string.Empty,

                FastestLapRank = result.TryGetProperty("FastestLap", out var fastestLap2) &&
                                 fastestLap2.TryGetProperty("rank", out var rankProp) &&
                                 int.TryParse(rankProp.GetString(), out var rank)
                    ? rank : 0
            });
        }

        return new RaceWeekendRaceResult
        {
            Season = raceWeekend.TryGetProperty("season", out var seasonProp) &&
                     int.TryParse(seasonProp.GetString(), out var parsedSeason)
                ? parsedSeason : 0,

            Round = raceWeekend.TryGetProperty("round", out var roundProp) &&
                    int.TryParse(roundProp.GetString(), out var parsedRound)
                ? parsedRound : 0,

            Name = raceWeekend.TryGetProperty("raceName", out var raceName)
                ? raceName.GetString() ?? "unknown" : "unknown",

            Results = raceResults
        };
    }


    public async Task<RaceWeekendQualifyingResult> GetQualifyingResultsAsync(int? year = null, int? race = null, string? session = "Qualifying")
    {
        session ??= "Qualifying";
        var sessionUpperFirst = char.ToUpper(session[0]) + session[1..];

        var results = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/{year?.ToString() ?? "current"}/{race?.ToString() ?? "last"}/{session}.json");

        using var doc = JsonDocument.Parse(results);

        var raceWeekend = doc.RootElement
            .GetProperty("MRData")
            .GetProperty("RaceTable")
            .GetProperty("Races")
            .EnumerateArray()
            .FirstOrDefault();

        if (raceWeekend.ValueKind == JsonValueKind.Undefined)
            return new RaceWeekendQualifyingResult { Season = 0, Round = 0, Name = "unknown", Results = [] };

        if (!raceWeekend.TryGetProperty($"{sessionUpperFirst}Results", out var resultsElement))
            return new RaceWeekendQualifyingResult { Season = 0, Round = 0, Name = "unknown", Results = [] };

        var qualiResult = new List<QualifyingResult>();

        foreach (var result in resultsElement.EnumerateArray())
        {
            result.TryGetProperty("Driver", out var driver);
            result.TryGetProperty("Constructor", out var constructor);

            qualiResult.Add(new QualifyingResult
            {
                Position = result.TryGetProperty("position", out var pos)
                    ? int.Parse(pos.GetString() ?? "0")
                    : 0,

                Driver = new Driver
                {
                    DriverId = driver.TryGetProperty("driverId", out var driverId)
                        ? driverId.GetString() ?? "unknown" : "unknown",

                    RaceNumber = driver.TryGetProperty("permanentNumber", out var permNum)
                        ? int.Parse(permNum.GetString() ?? "0")
                        : result.TryGetProperty("number", out var num)
                            ? int.Parse(num.GetString() ?? "0")
                            : 0,

                    Code = driver.TryGetProperty("code", out var code)
                        ? code.GetString() ?? "unknown" : "unknown",

                    GivenName = driver.TryGetProperty("givenName", out var givenName)
                        ? givenName.GetString() ?? "unknown" : "unknown",

                    FamilyName = driver.TryGetProperty("familyName", out var familyName)
                        ? familyName.GetString() ?? "unknown" : "unknown",

                    DateOfBirth = driver.TryGetProperty("dateOfBirth", out var dob) && DateOnly.TryParse(dob.GetString(), out var parsedDob)
                        ? parsedDob : DateOnly.MinValue,

                    Nationality = driver.TryGetProperty("nationality", out var driverNat)
                        ? driverNat.GetString() ?? "unknown" : "unknown",

                    Wikipedia = driver.TryGetProperty("url", out var driverUrl)
                        ? driverUrl.GetString() ?? "unknown" : "unknown",
                },

                Constructor = new Constructor
                {
                    ConstructorId = constructor.TryGetProperty("constructorId", out var constructorId)
                        ? constructorId.GetString() ?? "unknown" : "unknown",

                    Name = constructor.TryGetProperty("name", out var constructorName)
                        ? constructorName.GetString() ?? "unknown" : "unknown",

                    Nationality = constructor.TryGetProperty("nationality", out var constructorNat)
                        ? constructorNat.GetString() ?? "unknown" : "unknown",

                    Wikipedia = constructor.TryGetProperty("url", out var constructorUrl)
                        ? constructorUrl.GetString() ?? "unknown" : "unknown",
                },

                Q1 = result.TryGetProperty("Q1", out var q1) ? q1.GetString() ?? string.Empty : string.Empty,
                Q2 = result.TryGetProperty("Q2", out var q2) ? q2.GetString() ?? string.Empty : string.Empty,
                Q3 = result.TryGetProperty("Q3", out var q3) ? q3.GetString() ?? string.Empty : string.Empty
            });
        }

        return new RaceWeekendQualifyingResult
        {
            Season = raceWeekend.TryGetProperty("season", out var seasonProp) &&
                     int.TryParse(seasonProp.GetString(), out var parsedSeason)
                ? parsedSeason : 0,

            Round = raceWeekend.TryGetProperty("round", out var roundProp) &&
                    int.TryParse(roundProp.GetString(), out var parsedRound)
                ? parsedRound : 0,

            Name = raceWeekend.TryGetProperty("raceName", out var raceName)
                ? raceName.GetString() ?? "unknown" : "unknown",

            Results = qualiResult
        };
    }

    public async Task<int> GetNumberOfCompletedRaceWeekendsAsync(int? year = null)
    {
        var results = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/{year?.ToString() ?? "current"}/last/results.json");

        using var doc = JsonDocument.Parse(results);

        var lastRound = doc.RootElement
            .GetProperty("MRData")
            .GetProperty("RaceTable")
            .GetProperty("Races")
            .EnumerateArray()
            .FirstOrDefault();

        if (lastRound.ValueKind == JsonValueKind.Undefined)
            return 0;

        return lastRound.TryGetProperty("round", out var round) &&
               int.TryParse(round.GetString(), out var parsed)
            ? parsed : 0;
    }
}