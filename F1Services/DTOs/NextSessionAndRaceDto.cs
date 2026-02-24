using System;
using F1Data.Models;

namespace F1Services.DTOs;

public class NextSessionAndRaceDto
{
    public Session NextSession { get; set; }
    public Session NextRace { get; set; }
}
