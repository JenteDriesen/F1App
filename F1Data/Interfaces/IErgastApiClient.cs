using System;

namespace F1Data.Interfaces;

public interface IErgastApiClient
{
    Task<string> GetJsonAsync(string url);
}
