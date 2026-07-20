using F1Data.Models;
using F1Services.Interfaces;
using F1Services.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace F1Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RaceController : ControllerBase
    {
        private readonly IRaceService _raceService;
        private readonly IWeatherService _weatherService;

        public RaceController(IRaceService raceService, IWeatherService weatherService)
        {
            _raceService = raceService;
            _weatherService = weatherService;
        }

        [HttpGet("nextSessionRace")]
        public async Task<IActionResult> GetNextSessionAndRace()
        {
            var data = await _raceService.GetNextSessionAndRaceAsync();
            return Ok(data);
        }

        [HttpGet("nextRaceWeekend")]
        public async Task<IActionResult> GetNextRaceweekend()
        {
            var data = await _raceService.GetNextRaceweekendAsync();
            return Ok(data);
        }

        [HttpGet("sessionWeather")]
        public async Task<IActionResult> GetSessionWeather()
        {
            return Ok(await _weatherService.GetSessionWeatherAsync());
        }

        [HttpGet("{year}/{race}/results/{session}")]
        public async Task<IActionResult> GetRaceResults(int year, int race, string? session = "race")
        {
            session = session.ToLowerInvariant();

            if (session == "race" || session == "sprint")
            {
                return Ok(await _raceService.GetRaceResultsAsync(year, race, session));
            }
            if (session.Contains("qualifying"))
            {
                return Ok(await _raceService.GetQualifyingResultsAsync(year, race, session));
            }
            else return BadRequest();
        }

        [HttpGet("{year}")]
        public async Task<IActionResult> GetCompletedRaceWeekends(int year)
        {
            return Ok(await _raceService.GetCompletedRaceWeekendsAsync(year));
        }

        [HttpGet("{circuitId}/lastYearPodium")]
        public async Task<IActionResult> GetLastYearPodium(string circuitId)
        {
            return Ok(await _raceService.GetLastYearPodiumAsync(circuitId));
        }
    }
}
