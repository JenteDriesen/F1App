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

    public async Task<List<Raceweekend>> GetRaceWeekendsAsync()
    {
        var calendar = await _ergast.GetJsonAsync($"https://api.jolpi.ca/ergast/f1/current.json");

        using var doc = JsonDocument.Parse(calendar);

        var races = doc.RootElement
            .GetProperty("MRData")
            .GetProperty("RaceTable")
            .GetProperty("Races")
            .EnumerateArray();

        var now = DateTime.UtcNow;
        List<Raceweekend> weekends = [];

        foreach (var race in races)
        {
            var circuit = race.GetProperty("Circuit");
            var location = circuit.GetProperty("Location");

            List<Session> sessions = [];

            var jsonSessions = race.EnumerateObject()
                .Where(p =>
                    p.Name.EndsWith("Practice", StringComparison.OrdinalIgnoreCase) ||
                    p.Name.Equals("Qualifying", StringComparison.OrdinalIgnoreCase) ||
                    p.Name.Contains("Sprint", StringComparison.OrdinalIgnoreCase)
                    )
                .ToList();

            foreach (var session in jsonSessions)
            {
                sessions.Add(new Session
                {
                    Name = session.Name,
                    SessionDateTime = DateTimeOffset.Parse($"{session.Value.GetProperty("date").GetString()}T{session.Value.GetProperty("time").GetString()}").UtcDateTime
                });
            }

            var weekend = new Raceweekend
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
                Sessions = sessions
            };
            weekends.Add(weekend);
        }

        return weekends;
    }
}
