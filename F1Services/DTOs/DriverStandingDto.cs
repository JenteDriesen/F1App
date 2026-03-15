using System;

namespace F1Data.DTOs;

public class DriverStandingDto
{
    public int Position { get; set; }
    public decimal Points { get; set; }
    public int Wins { get; set; }
    public string DriverId { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string Nationality { get; set; }
    public string Constructor { get; set; }
    public string ConstructorNationality { get; set; }
    public string WikiUrl { get; set; }

}
