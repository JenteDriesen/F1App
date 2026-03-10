using System;

namespace F1Services.DTOs;

public class RaceWeekendDto
{
    public int Round { get; set; }
    public string Name { get; set; }
    public List<string> Sessions { get; set; }
}
