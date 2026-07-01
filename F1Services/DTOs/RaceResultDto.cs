using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace F1Services.DTOs;

public class RaceResultDto
{
    public int Position { get; set; }
    public string Driver { get; set; }
    public string Team { get; set; }
    public string Status { get; set; }
    public string Time { get; set; }
    public decimal Points { get; set; }
    public bool FastestLap { get; set; }
}
