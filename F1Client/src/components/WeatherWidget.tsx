import { useEffect, useState } from "react";
import DailyWeatherCard from "./DailyWeatherCard";
import HourlyWeatherCard from "./HourlyWeatherCard";

interface DailyApiResponse {
    date: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitationSum: number[];
    precipitationProbabilityMax: number[];
    precipitationHours: number[];
    windDirectionDominant: number[];
    windSpeedMax: number[];
}

interface HourlyApiResponse {
    hour: string[];
    temperature: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeed: number[];
    windDirection: number[];
}

export default function WeatherWidget() {
    const [daily, setDaily] = useState<DailyApiResponse>();
    const [hourly, setHourly] = useState<HourlyApiResponse>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/race/raceWeekendWeather").then(res => res.json()),
            fetch("/api/race/raceDayWeather").then(res => res.json())
        ]).then(([dailyData, hourlyData]) => {
            setDaily(dailyData);
            setHourly(hourlyData);
            setLoading(false);
        });
    }, []);

    if (loading) return <p className="text-zinc-500 dark:text-zinc-400">Loading weekend weather...</p>;

    return (
        <div className="rounded-xl  p-4 bg-white dark:bg-zinc-800">
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Weekend weather</p>
            <div className="flex gap-4 mb-6">
                <DailyWeatherCard day={daily!} index={0} />
                <DailyWeatherCard day={daily!} index={1} />
            </div>
            <HourlyWeatherCard hourly={hourly!} />
        </div>
    );
}