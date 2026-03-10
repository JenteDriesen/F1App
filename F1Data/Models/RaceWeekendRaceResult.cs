using System;

namespace F1Data.Models;

public class RaceWeekendRaceResult
{
    public int Season { get; set; }
    public int Round { get; set; }
    public String Name { get; set; }
    public List<RaceResult> Results { get; set; }
}
