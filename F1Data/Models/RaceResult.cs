using System;

namespace F1Data.Models;

public class RaceResult
{
    public int Position { get; set; }
    public Driver Driver { get; set; }
    public Constructor Constructor { get; set; }
    public string Status { get; set; }
    public string RaceTime { get; set; }
    public decimal Points { get; set; }
    public string FastestLapTime { get; internal set; }
    public int FastestLapRank { get; internal set; }
}
