using System;
using F1Data.Models;

namespace F1Data.Interfaces;

public interface IRaceRepository
{
    Task<List<Raceweekend>> GetRaceWeekendsAsync();
}
