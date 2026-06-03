import { useState, useEffect } from "react";
import MiniMap from "../components/MiniMap";
import DailyWeatherCard from "../components/DailyWeatherCard";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import CountDown from "../components/Countdown";

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
    const [nextRace, setNextRace] = useState<Session | null>(null);
    const [nextSession, setNextSession] = useState<Session | null>(null);
    const [nextWeekendInfo, setNextWeekendInfo] = useState<WeekendInfo | null>(null);
    const [daily, setDaily] = useState<DailyWeather | null>(null);
    const [hourly, setHourly] = useState<HourlyWeather | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/race/nextSessionRace").then(res => res.json()),
            fetch("/api/race/nextRaceweekend").then(res => res.json()),
            fetch("/api/race/raceWeekendWeather").then(res => res.json()),
            fetch("/api/race/raceDayWeather").then(res => res.json()),
        ]).then(([sessionRaceData, weekendData, dailyData, hourlyData]) => {
            setNextSession(sessionRaceData.nextSession);
            setNextRace(sessionRaceData.nextRace);
            setNextWeekendInfo(weekendData);
            setDaily(dailyData);
            setHourly(hourlyData);
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
                {/* Left column */}
                <div className="flex flex-col gap-4 lg:w-2/5">
                    <MiniMap lat={lat} lng={lng} />
                    {nextSession && nextRace && nextSession.sessionDateTime !== nextRace.sessionDateTime && (
                        <CountDown name={nextSession.name} sessionDateTime={nextSession.sessionDateTime} />
                    )}
                    {nextRace && (
                        <CountDown name={nextRace.name} sessionDateTime={nextRace.sessionDateTime} />
                    )}
                </div>

                {/* Right column - weather */}
                <div className="flex-1 rounded-xl p-4 bg-white dark:bg-zinc-800">
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
        </div>
    );
}