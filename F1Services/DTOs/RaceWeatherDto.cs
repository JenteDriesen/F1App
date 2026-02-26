using System;

namespace F1Services.DTOs;

public class RaceWeatherDto
{
    public List<string> Hour { get; set; } = [];
    public List<double> Temperature { get; set; } = [];
    public List<double> Precipitation { get; set; } = [];
    public List<double> PrecipitationProbability { get; set; } = [];
    public List<double> WindSpeed { get; set; } = [];
    public List<double> WindDirection { get; set; } = [];
}
