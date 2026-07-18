import { useEffect, useState } from "react";
import MiniMap from "../components/MiniMap";
import SessionSchedule from "../components/SessionSchedule";
import LastYearPodium from "../components/LastYearPodium";
import WeatherWidget from "../components/WeatherWidget";
import { type HourlyWeather } from "../types";

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

export default function NextWeekendInfoPage() {
    const [loading, setLoading] = useState(true);
    const [nextWeekendInfo, setNextWeekendInfo] = useState<WeekendInfo | null>(null);
    const [hourly, setHourly] = useState<Record<string, HourlyWeather> | null>(null);
    const [weekendError, setWeekendError] = useState<string | null>(null);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        Promise.allSettled([
            fetch("/api/race/nextRaceweekend").then(res => { if (!res.ok) throw new Error(); return res.json(); }),
            fetch("/api/race/sessionWeather").then(res => { if (!res.ok) throw new Error(); return res.json(); }),
        ]).then(([weekendRes, weatherRes]) => {
            if (cancelled) return;

            if (weekendRes.status === "fulfilled") setNextWeekendInfo(weekendRes.value);
            else setWeekendError("Couldn't load weekend info.");

            if (weatherRes.status === "fulfilled") setHourly(weatherRes.value);
            else setWeatherError("Couldn't load weather.");

            setLoading(false);
        });

        return () => { cancelled = true; };
    }, []);

    const lat = nextWeekendInfo?.circuit.location.latitude;
    const lng = nextWeekendInfo?.circuit.location.longitude;

    if (loading) return <div className="text-zinc-500 dark:text-zinc-400 p-8">Loading...</div>;
    if (weekendError) return <p className="text-zinc-500 dark:text-zinc-400 p-8">{weekendError}</p>;
    if (!nextWeekendInfo) return <p className="text-zinc-500 dark:text-zinc-400 p-8">Not found.</p>;

    return (
        <div className="px-6 py-8">
            <header className="mb-8 border-b border-zinc-200 dark:border-zinc-700">
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-red-600 mb-1">Round {nextWeekendInfo.round}</p>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{nextWeekendInfo.circuit.name}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {nextWeekendInfo.circuit.location.locality}, {nextWeekendInfo.circuit.location.country} · {nextWeekendInfo.season}
                    </p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 md:auto-rows-fr">
                {/* first row */}
                {lat != null && lng != null && (
                    <div className="md:flex-1 w-full rounded-xl py-4 bg-white dark:bg-zinc-800">
                        <MiniMap lat={lat} lng={lng} />
                    </div>
                )}
                <div className="md:flex-1 w-full rounded-xl py-4 bg-white dark:bg-zinc-800">
                    <SessionSchedule sessions={nextWeekendInfo.sessions} raceDateTime={nextWeekendInfo.raceDateTime} />
                </div>

                {/* second row */}
                <div className="md:flex-1 w-full rounded-xl py-4 bg-white dark:bg-zinc-800">
                    {weatherError
                        ? <p className="text-zinc-400 text-sm">{weatherError}</p>
                        : hourly && <WeatherWidget weather={hourly} />
                    }
                </div>
                <div className="md:flex-1 w-full rounded-xl py-4 bg-white dark:bg-zinc-800">
                    <LastYearPodium circuitId={nextWeekendInfo.circuit.id} />
                </div>
            </div>
        </div>
    );
}