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

        [HttpGet("raceWeekendWeather")]
        public async Task<IActionResult> GetRaceWeekendWeather()
        {
            var weekend = await _raceService.GetNextRaceweekendAsync();

            var lat = weekend.Circuit.Location.Latitude;
            var lng = weekend.Circuit.Location.Longitude;
            var startDate = weekend.Sessions[0].SessionDateTime.ToString("yyyy-MM-dd");
            var endDate = weekend.Sessions[^1].SessionDateTime.ToString("yyyy-MM-dd");


            var data =
                await _weatherService.GetRaceWeekendWeatherAsync(lat, lng, startDate, endDate);
            return Ok(data);
        }

        [HttpGet("raceDayWeather")]
        public async Task<IActionResult> GetRaceDayWeather()
        {
            var weekend = await _raceService.GetNextRaceweekendAsync();

            var lat = weekend.Circuit.Location.Latitude;
            var lng = weekend.Circuit.Location.Longitude;

            var date = weekend.RaceDateTime.ToString("yyy-MM-ddTHH:mm");
            Console.WriteLine($"{date}");

            var nextDay = weekend.RaceDateTime.AddDays(1).ToString("yyy-MM-dd");

            var data =
                await _weatherService.GetRaceDayWeatherDetailAsync(lat, lng, date, nextDay);
            return Ok(data);
        }
    }
}
