using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace F1Services.DTOs;

public class QualifyingResultDto
{
    public int Position { get; set; }
    public string Driver { get; set; }
    public string Team { get; set; }
    public string? Q1 { get; set; }
    public string? Q2 { get; set; }
    public string? Q3 { get; set; }
}