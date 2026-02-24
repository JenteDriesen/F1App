using System;
using System.Text.Json;
using F1Data.Interfaces;

namespace F1Data.Models;

public class ErgastApiClient : IErgastApiClient
{
    private readonly HttpClient _httpClient;

    public ErgastApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> GetJsonAsync(string url)
    {
        return await _httpClient.GetStringAsync(url);
    }
}
