interface DailyWeather {
    date: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitationSum: number[];
    precipitationProbabilityMax: number[];
    precipitationHours: number[];
    windDirectionDominant: number[];
    windSpeedMax: number[];
}

interface Props {
    day: DailyWeather;
    index: number;
}

export default function DailyWeatherCard({ day, index }: Props) {
    const date = new Date(day.date[index]);
    const max = Math.round(day.temperatureMax[index]);
    const min = Math.round(day.temperatureMin[index]);
    const rainChance = day.precipitationProbabilityMax[index];
    const rain = day.precipitationSum[index];
    const wind = day.windSpeedMax[index];
    const windDir = day.windDirectionDominant[index];

    return (
        <div className="flex-1 rounded-xl border border-red-600 p-3 text-center bg-white dark:bg-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                {date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                {max}° <span className="text-base font-normal text-zinc-400">/ {min}°</span>
            </p>
            <div className="flex justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                <span>🌧</span>
                <span>{rain} mm</span>
                <span>{rainChance}%</span>
            </div>
            <div className="flex justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>💨</span>
                <span>{wind.toFixed(1)} km/h</span>
                <span style={{ display: "inline-block", transform: `rotate(${windDir}deg)` }}>▲</span>
            </div>
        </div>
    );
}