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

    public async Task<RaceWeekend> GetRaceWeekendAsync(int? year = null, int? round = null)
    {
        var raceWeekends = await _raceRepository.GetRaceWeekendsAsync(year);
        var raceWeekend = raceWeekends.FirstOrDefault(r => r.Round == round);

        return raceWeekend;
    }

    public async Task<RaceWeekend> GetNextRaceweekendAsync()
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

        Dictionary<string, string> sessionNames = new()
        {
             {"FirstPractice", "FP1"},
             {"SecondPractice", "FP2"},
             {"ThirdPractice", "FP3"},
             {"SprintQualifying", "Sprint Qualifying"}
        };

        return new NextSessionAndRaceDto()
        {
            NextSession = new Session
            {
                Name = sessionNames.GetValueOrDefault(nextSession.Name) ?? SplitCamelCase().Replace(nextSession.Name, " $1"),
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
        return await _raceRepository.GetQualifyingResultsAsync(year, race, session);
    }

    public async Task<RaceWeekendRaceResult> GetRaceResultsAsync(int? year = null, int? race = null, string? session = "race")
    {
        return await _raceRepository.GetRaceResultsAsync(year, race, session);
    }

    public async Task<List<RaceWeekendDto>> GetCompletedRaceWeekendsAsync(int? year)
    {
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
    }

    [GeneratedRegex("(\\B[A-Z])")]
    private static partial Regex SplitCamelCase();
}
