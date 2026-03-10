using System;

namespace F1Data.Models;

public class Driver
{
    public string DriverId { get; set; }
    public int RaceNumber { get; set; }
    public string Code { get; set; }
    public string GivenName { get; set; }
    public string FamilyName { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string Nationality { get; set; }
    public string Wikipedia { get; set; }
}

