using System;

namespace F1Data.Models;

public class Raceweekend
{
    public int Season { get; set; }
    public int Round { get; set; }
    public string Name { get; set; }
    public Circuit Circuit { get; set; }
    public DateTime RaceDateTime { get; set; }
    public List<Session> Sessions { get; set; }
}
