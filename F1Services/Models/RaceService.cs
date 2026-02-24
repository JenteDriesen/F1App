using System;
using System.Text.Json;
using System.Text.RegularExpressions;
using F1Data.Interfaces;
using F1Data.Models;
using F1Services.DTOs;
using F1Services.Interfaces;

namespace F1Services.Models;

public partial class RaceService : IRaceService
{
    private readonly IErgastApiClient _ergast;
    private readonly IRaceRepository _raceRepository;

    public RaceService(IErgastApiClient ergast, IRaceRepository raceRepository)
    {
        _ergast = ergast;
        _raceRepository = raceRepository;
    }

    public async Task<string> GetLastRaceSummaryAsync()
    {
        var json = ""; //await _ergast.GetLastRaceResultsAsync();

        return json;
    }

    public async Task<Raceweekend> GetNextRaceweekendAsync()
    {
        var weekends = await _raceRepository.GetRaceWeekendsAsync();
        var nextRace = weekends.FirstOrDefault(r =>
                                r.RaceDateTime > DateTime.UtcNow);

        return nextRace;
    }

    public async Task<NextSessionAndRaceDto> GetNextSessionAndRaceAsync()
    {
        var nextRace = GetNextRaceweekendAsync().Result;

        var nextSession = nextRace.Sessions.FirstOrDefault(s =>
                            s.SessionDateTime > DateTime.UtcNow)
                            ?? new Session { Name = "Race", SessionDateTime = nextRace.RaceDateTime };

        return new NextSessionAndRaceDto()
        {
            NextSession = new Session
            {
                Name = SplitCamelCase().Replace(nextSession.Name, " $1"),
                SessionDateTime = nextSession.SessionDateTime
            },
            NextRace = new Session
            {
                Name = nextRace.Name,
                SessionDateTime = nextRace.RaceDateTime
            }
        };
    }

    [GeneratedRegex("(\\B[A-Z])")]
    private static partial Regex SplitCamelCase();
}
