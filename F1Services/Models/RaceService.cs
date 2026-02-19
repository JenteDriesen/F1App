using System;
using F1Data.Interfaces;
using F1Services.Interfaces;

namespace F1Services.Models;

public class RaceService : IRaceService
{
    private readonly IErgastApiClient _ergast;

    public RaceService(IErgastApiClient ergast)
    {
        _ergast = ergast;
    }

    public async Task<string> GetLastRaceSummaryAsync()
    {
        var json = ""; //await _ergast.GetLastRaceResultsAsync();

        return json;
    }
}
