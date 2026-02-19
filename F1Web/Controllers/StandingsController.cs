using F1Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace F1Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StandingsController : ControllerBase
    {
        private readonly IStandingsService _standingsService;

        public StandingsController(IStandingsService standingsService)
        {
            _standingsService = standingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDriverStandings(int? year = null, int? race = null)
        {
            var data = await _standingsService.GetDriverStandingsAsync(year, race);

            return Ok(data);
        }
    }
}
