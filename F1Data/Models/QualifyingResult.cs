using System;

namespace F1Data.Models;

public class QualifyingResult
{
    public int Position { get; set; }
    public Driver Driver { get; set; }
    public Constructor Constructor { get; set; }
    public string? Q1 { get; set; }
    public string? Q2 { get; set; }
    public string? Q3 { get; set; }
}
