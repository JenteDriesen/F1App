using System;

namespace F1Data.Models;

public class Location
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Locality { get; set; }
    public string Country { get; set; }
}
