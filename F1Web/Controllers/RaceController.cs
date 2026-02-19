using F1Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace F1Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RaceController : ControllerBase
    {
        private readonly IRaceService _raceService;

        public RaceController(IRaceService raceService)
        {
            _raceService = raceService;
        }

        [HttpGet("last")]
        public async Task<IActionResult> GetLastRace()
        {
            var data = await _raceService.GetLastRaceSummaryAsync();
            return Ok(data);
        }
    }
}
