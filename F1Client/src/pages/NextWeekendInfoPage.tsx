import { useEffect, useState } from "react";
import MiniMap from "../components/MiniMap";
import DailyWeatherCard from "../components/DailyWeatherCard";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import SessionSchedule from "../components/SessionSchedule";

interface Session {
    name: string;
    sessionDateTime: string;
}

interface LocationInfo {
    latitude: number;
    longitude: number;
    locality: string;
    country: string;
}

interface CircuitInfo {
    id: string;
    name: string;
    location: LocationInfo;
}

interface WeekendInfo {
    season: number;
    round: number;
    circuit: CircuitInfo;
    raceDateTime: string;
    sessions: Session[];
}

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

interface HourlyWeather {
    hour: string[];
    temperature: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeed: number[];
    windDirection: number[];
}

export default function NextWeekendInfoPage() {
    const [loading, setLoading] = useState(true);
    const [nextWeekendInfo, setNextWeekendInfo] = useState<WeekendInfo | null>(null);
    const [daily, setDaily] = useState<DailyWeather | null>(null);
    const [hourly, setHourly] = useState<HourlyWeather | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/race/nextRaceweekend").then(res => { if (!res.ok) throw new Error("nextRaceweekend"); return res.json(); }),
            fetch("/api/race/raceWeekendWeather").then(res => { if (!res.ok) throw new Error("raceWeekendWeather"); return res.json(); }),
            fetch("/api/race/raceDayWeather").then(res => { if (!res.ok) throw new Error("raceDayWeather"); return res.json(); }),
        ]).then(([weekendData, dailyData, hourlyData]) => {
            setNextWeekendInfo(weekendData);
            setDaily(dailyData);
            setHourly(hourlyData);
            setLoading(false);
        }).catch(err => {
            console.error("Failed:", err.message);
            setLoading(false);
        });
    }, []);

    const lat = nextWeekendInfo?.circuit.location.latitude ?? 0;
    const lng = nextWeekendInfo?.circuit.location.longitude ?? 0;

    if (loading) return <div className="text-zinc-500 dark:text-zinc-400 p-8">Loading...</div>;
    if (!nextWeekendInfo) return <p className="text-zinc-500 dark:text-zinc-400 p-8">Not found.</p>;

    return (
        <div className="px-6 py-8">
            <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-red-600 mb-1">Round {nextWeekendInfo.round}</p>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{nextWeekendInfo.circuit.name}</h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                    {nextWeekendInfo.circuit.location.locality}, {nextWeekendInfo.circuit.location.country} · {nextWeekendInfo.season}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start">
                <div className="flex flex-col gap-4 lg:w-1/2 w-full shrink-0 min-w-[30rem]">
                    <MiniMap lat={lat} lng={lng} />
                </div>

                <div className="lg:flex-1 lg:border-l border-t lg:border-t-0 border-zinc-200 dark:border-zinc-700 lg:pl-4 pt-4 lg:pt-0 w-full lg:w-auto">
                    <SessionSchedule
                        sessions={nextWeekendInfo.sessions}
                        raceDateTime={nextWeekendInfo.raceDateTime}
                    />
                </div>
            </div>

            <div className="flex-1 rounded-xl p-4 bg-white dark:bg-zinc-800 min-w-[30rem]">
                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Weekend weather</p>
                {daily && (
                    <div className="flex gap-4 mb-6">
                        <DailyWeatherCard day={daily} index={0} />
                        <DailyWeatherCard day={daily} index={1} />
                    </div>
                )}
                {hourly && <HourlyWeatherCard hourly={hourly} />}
            </div>
        </div>
    );
}