using System;
using F1Data.Models;
using F1Services.DTOs;

namespace F1Services.Interfaces;

public interface IRaceService
{
    Task<NextSessionAndRaceDto> GetNextSessionAndRaceAsync();
    Task<Raceweekend> GetNextRaceweekendAsync();
}
