interface HourlyWeather {
    hour: string[];
    temperature: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeed: number[];
    windDirection: number[];
}

interface Props {
    hourly: HourlyWeather;
}

export default function HourlyWeatherCard({ hourly }: Props) {
    const length = hourly.hour.length;

    return (
        <div>
            Raceday
            <div className="card-body p-1">
                <div className="d-flex overflow-auto justify-content-center align-items-start">

                    {Array.from({ length }).map((_, i) => {
                        const hourDate = new Date(hourly.hour[i] + "Z");

                        return (
                            <div
                                key={i}
                                className="text-center px-2"
                                style={{ minWidth: "70px" }}
                            >
                                <div className={`small mb-1 ${i === 2 ? "fw-bold text-danger" : "text-muted"}`}>{hourDate.getHours() + ":00"}</div>

                                <div className="fw-bold mb-1">{Math.round(hourly.temperature[i])}°</div>

                                <div className="small mb-1">🌧 {hourly.precipitationProbability[i]}%</div>

                                <div className="text-muted small mb-1">{hourly.precipitation[i]} mm</div>

                                <div className="small mb-1">💨 {hourly.windSpeed[i].toFixed(1)}</div>
                                <div>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            transform: `rotate(${hourly.windDirection[i]}deg)`
                                        }}
                                    >
                                        ▲
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}