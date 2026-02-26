using System;

namespace F1Services.DTOs;

public class DailyWeatherDto
{
    public List<string> Date { get; set; } = [];
    public List<double> TemperatureMax { get; set; } = [];
    public List<double> TemperatureMin { get; set; } = [];
    public List<double> PrecipitationSum { get; set; } = [];
    public List<double> PrecipitationProbabilityMax { get; set; } = [];
    public List<double> PrecipitationHours { get; set; } = [];
    public List<double> WindSpeedMax { get; set; } = [];
    public List<double> WindDirectionDominant { get; set; } = [];
}
