

import { useEffect, useState } from "react";

interface SessionWeather {
    hour: string[];
    temperature: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeed: number[];
    windDirection: number[];
}

interface Props {
    weather: Record<string, SessionWeather>;
}

const SESSION_LABELS: Record<string, string> = {
    FirstPractice: "FP1",
    SecondPractice: "FP2",
    ThirdPractice: "FP3",
    Qualifying: "Qualifying",
    Sprint: "Sprint",
    SprintQualifying: "SQ",
    SprintShootout: "SQ",
    Race: "Race",
};

function toCardinal(deg: number): string {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
}

const ROW_HEIGHTS = [36, 44, 52, 36, 52];

const ROW_LABELS = [
    { icon: null, text: null },
    { icon: "ti-temperature", text: "Temperature (°C)" },
    { icon: "ti-umbrella", text: "Rain (%)" },
    { icon: "ti-drop", text: "Precipitation (mm)" },
    { icon: "ti-wind", text: "Wind Speed (km/h)" },
];

export default function WeatherWidget({ weather }: Props) {
    const sessions = Object.keys(weather);
    const defaultSession = sessions.includes("Race") ? "Race" : sessions[sessions.length - 1];
    const [selectedSession, setSelectedSession] = useState(() => defaultSession);

    useEffect(() => {
        // Only update selectedSession when the current selection is no longer available
        if (!sessions.includes(selectedSession)) {
            // defer state update to avoid triggering a synchronous state change inside the effect
            const id = setTimeout(() => {
                setSelectedSession(sessions.includes("Race") ? "Race" : sessions[sessions.length - 1]);
            }, 0);

            return () => clearTimeout(id);
        }
    }, [sessions, selectedSession]);

    const hourly = weather[selectedSession];
    if (!hourly) return <p className="text-zinc-500 dark:text-zinc-400 text-sm">No data.</p>;

    const length = hourly.hour.length;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest text-zinc-400">Weather</p>
                <div className="flex gap-1 flex-wrap justify-end">
                    {sessions.map(s => (
                        <button
                            key={s}
                            onClick={() => setSelectedSession(s)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedSession === s
                                ? "bg-red-600 text-white"
                                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                                }`}
                        >
                            {SESSION_LABELS[s] ?? s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="flex border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">

                {/* Row label column */}
                <div className="flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-700">
                    {ROW_LABELS.map((row, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-1.5 px-3 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-400 whitespace-nowrap ${i < ROW_LABELS.length - 1 ? "border-b border-zinc-200 dark:border-zinc-700" : ""}`}
                            style={{ height: ROW_HEIGHTS[i] }}
                        >
                            {row.icon && <i className={`ti ${row.icon}`} aria-hidden="true" />}
                            {row.text}
                        </div>
                    ))}
                </div>

                {/* Hour columns */}
                {Array.from({ length }).map((_, i) => {
                    const hourDate = new Date(hourly.hour[i] + "Z");
                    const isStart = i === 2;
                    const rainPct = hourly.precipitationProbability[i];
                    const dir = hourly.windDirection[i];
                    const isLast = i === length - 1;

                    return (
                        <div
                            key={i}
                            className={`flex flex-col flex-1 ${!isLast ? "border-r border-zinc-200 dark:border-zinc-700" : ""} ${isStart ? "border rounded border-red-400 dark:border-red-600 bg-red-600/10 dark:bg-red-600/20" : ""}`}
                        >
                            {/* Time */}
                            <div
                                className={`flex items-center justify-center text-xs font-medium border-b border-zinc-200 dark:border-zinc-700 ${isStart ? "text-zinc-700 dark:text-white font-bold bg-red-600/10 dark:bg-red-600/20" : "text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900"}`}
                                style={{ height: ROW_HEIGHTS[0] }}
                            >
                                {hourDate.getHours()}:00
                            </div>

                            {/* Temp */}
                            <div
                                className="flex items-center justify-center text-base font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-700"
                                style={{ height: ROW_HEIGHTS[1] }}
                            >
                                {Math.round(hourly.temperature[i])}°
                            </div>

                            {/* Rain */}
                            <div
                                className="flex flex-col items-center justify-center gap-1.5 px-2 border-b border-zinc-200 dark:border-zinc-700"
                                style={{ height: ROW_HEIGHTS[2] }}
                            >
                                <div className="w-full h-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-300 dark:bg-blue-500 rounded-full"
                                        style={{ width: `${rainPct}%` }}
                                    />
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{rainPct}%</span>
                            </div>

                            {/* Precip */}
                            <div
                                className="flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700"
                                style={{ height: ROW_HEIGHTS[3] }}
                            >
                                {hourly.precipitation[i].toFixed(1)}
                            </div>

                            {/* Wind */}
                            <div
                                className="flex flex-col items-center justify-center gap-0.5"
                                style={{ height: ROW_HEIGHTS[4] }}
                            >
                                <span className="text-xs font-medium text-zinc-900 dark:text-white">
                                    {Math.round(hourly.windSpeed[i])}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-zinc-400">
                                    <span style={{ display: "inline-block", transform: `rotate(${dir}deg)`, fontSize: "11px", lineHeight: 1 }}>↑</span>
                                    {toCardinal(dir)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}








































