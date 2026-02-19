using System;

namespace F1Services.Interfaces;

public interface IRaceService
{
    Task<string> GetLastRaceSummaryAsync();
}
