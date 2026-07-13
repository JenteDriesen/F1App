import { useEffect, useState } from "react";
import MiniMap from "../components/MiniMap";
import SessionSchedule from "../components/SessionSchedule";
import LastYearPodium from "../components/LastYearPodium";
import WeatherWidget from "../components/WeatherWidget";

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
    const [hourly, setHourly] = useState<Record<string, HourlyWeather> | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/race/nextRaceweekend").then(res => { if (!res.ok) throw new Error("nextRaceweekend"); return res.json(); }),
            fetch("/api/race/sessionWeather").then(res => { if (!res.ok) throw new Error("sessionWeather"); return res.json(); }),
        ]).then(([weekendData, hourlyData]) => {
            setNextWeekendInfo(weekendData);
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

            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="md:flex-1 w-full shrink-0 py-4">
                        <MiniMap lat={lat} lng={lng} />
                    </div>
                    <div className="md:flex-1 w-full">
                        <SessionSchedule sessions={nextWeekendInfo.sessions} raceDateTime={nextWeekendInfo.raceDateTime} />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:flex-1 w-full rounded-xl py-4 bg-white dark:bg-zinc-800">
                        {hourly && <WeatherWidget weather={hourly} />}
                    </div>
                    <div className="md:flex-1 w-full">
                        <LastYearPodium circuitId={nextWeekendInfo.circuit.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}