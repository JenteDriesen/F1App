using System;

namespace F1Data.Models;

public class RaceResult
{
    public int Position { get; set; }
    public Driver Driver { get; set; }
    public Constructor Constructor { get; set; }
    public string Status { get; set; }
    public string RaceTime { get; set; }
    public string FastestLap { get; set; }
}
