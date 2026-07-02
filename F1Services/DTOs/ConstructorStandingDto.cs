using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace F1Services.DTOs;

public class ConstructorStandingDto
{
    public int Position { get; set; }
    public decimal Points { get; set; }
    public int Wins { get; set; }
    public string ConstructorId { get; set; }
    public string Name { get; set; }
    public string Nationality { get; set; }
    public string WikiUrl { get; set; }
}
