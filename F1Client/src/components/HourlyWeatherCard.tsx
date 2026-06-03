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
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Race day</p>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, 1fr)` }}>
                {Array.from({ length }).map((_, i) => {
                    const hourDate = new Date(hourly.hour[i] + "Z");
                    const isRace = i === 2;

                    return (
                        <div
                            key={i}
                            className={`flex flex-col items-center px-2 py-2 rounded-lg text-sm ${isRace ? "border border-red-600 bg-red-50 dark:bg-red-950" : "text-zinc-600 dark:text-zinc-400"}`}
                        >
                            <span className={`text-xs mb-1 ${isRace ? "font-bold text-red-600" : "text-zinc-400"}`}>
                                {hourDate.getHours()}:00
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white mb-1">{Math.round(hourly.temperature[i])}°</span>
                            <span className="text-xs mb-1">🌧 {hourly.precipitationProbability[i]}%</span>
                            <span className="text-xs text-zinc-400 mb-1">{hourly.precipitation[i]} mm</span>
                            <span className="text-xs mb-1">💨 {hourly.windSpeed[i].toFixed(1)}</span>
                            <span style={{ display: "inline-block", transform: `rotate(${hourly.windDirection[i]}deg)` }}>▲</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}