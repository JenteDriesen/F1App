import { useEffect, useState } from "react";
import MiniMap from "../components/MiniMap";
import SessionSchedule from "../components/SessionSchedule";
import LastYearPodium from "../components/LastYearPodium";
import WeatherWidget from "../components/WeatherWidget";
import Card from "../components/Card";
import type { SessionWeather, WeekendInfo } from "../types/race";

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return res.json() as Promise<T>;
}

export default function NextWeekendInfoPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextWeekendInfo, setNextWeekendInfo] = useState<WeekendInfo | null>(null);
    const [hourly, setHourly] = useState<Record<string, SessionWeather> | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            const [weekendRes, weatherRes] = await Promise.allSettled([
                fetchJson<WeekendInfo>("/api/race/nextRaceweekend", controller.signal),
                fetchJson<Record<string, SessionWeather>>("/api/race/sessionWeather", controller.signal),
            ]);

            // Component unmounted while fetching — don't touch state
            if (controller.signal.aborted) return;

            // Hard dependency: without it the page is meaningless → error state
            if (weekendRes.status === "fulfilled") {
                setNextWeekendInfo(weekendRes.value);
            } else {
                console.error(weekendRes.reason);
                setError("Couldn't load the next race weekend.");
            }

            // Soft dependency: the card renders its own fallback instead
            if (weatherRes.status === "fulfilled") {
                setHourly(weatherRes.value);
            } else {
                console.error(weatherRes.reason);
            }

            setLoading(false);
        }

        load();
        return () => controller.abort();
    }, []);

    // Skeleton mirrors the final layout of the page
    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-8" role="status" aria-label="Loading">
                <div className="mb-6 space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-8 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                    <div className="h-64 animate-pulse rounded-xl bg-zinc-200 md:col-span-2 dark:bg-zinc-700" />
                    <div className="h-64 animate-pulse rounded-xl bg-zinc-200 md:col-span-3 dark:bg-zinc-700" />
                    <div className="h-56 animate-pulse rounded-xl bg-zinc-200 md:col-span-3 dark:bg-zinc-700" />
                    <div className="h-56 animate-pulse rounded-xl bg-zinc-200 md:col-span-2 dark:bg-zinc-700" />
                </div>
            </div>
        );
    }

    // Loading finished and weekendInfo is still null → the request failed
    if (error || !nextWeekendInfo) {
        return (
            <p className="mx-auto max-w-6xl px-6 py-8 text-red-600">
                {error ?? "Couldn't load the next race weekend."}
            </p>
        );
    }

    const { circuit } = nextWeekendInfo;

    /* const sessionStarts = Object.fromEntries(
        nextWeekendInfo.sessions.map(s => [s.name, s.sessionDateTime])
    ); */

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <header className="mb-6">
                <p className="mb-1 text-xs uppercase tracking-widest text-red-600">Round {nextWeekendInfo.round}</p>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{circuit.name}</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    {circuit.location.locality}, {circuit.location.country} · {nextWeekendInfo.season}
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                <Card className="md:col-span-2">
                    <MiniMap lat={circuit.location.latitude} lng={circuit.location.longitude} />
                </Card>
                <Card className="md:col-span-3">
                    <SessionSchedule sessions={nextWeekendInfo.sessions} raceDateTime={nextWeekendInfo.raceDateTime} />
                </Card>
                <Card className="md:col-span-3">
                    {hourly
                        ? <WeatherWidget weather={hourly} />
                        : <p className="text-sm text-zinc-500 dark:text-zinc-400">Weather data unavailable.</p>}
                </Card>
                <Card className="md:col-span-2">
                    <LastYearPodium circuitId={circuit.id} />
                </Card>
            </div>
        </div>
    );
}