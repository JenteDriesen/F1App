using System;

namespace F1Data.Models;

public class RaceWeekendQualifyingResult
{
    public int Season { get; set; }
    public int Round { get; set; }
    public String Name { get; set; }
    public List<QualifyingResult> Results { get; set; }
}
