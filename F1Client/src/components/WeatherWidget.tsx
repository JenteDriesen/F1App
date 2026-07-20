import { useMemo, useState } from "react";
import { IconTemperature, IconUmbrella, IconDroplet, IconWind } from "@tabler/icons-react";
import { type SessionWeather } from "../types/race";

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
    const normalized = ((deg % 360) + 360) % 360;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(normalized / 45) % 8];
}


const ROWS = [
    { height: 36, icon: null, text: null },
    { height: 44, icon: <IconTemperature size={14} />, text: "°C" },
    { height: 52, icon: <IconUmbrella size={14} />, text: "Rain %" },
    { height: 36, icon: <IconDroplet size={14} />, text: "mm" },
    { height: 52, icon: <IconWind size={14} />, text: "km/h" },
];

export default function WeatherWidget({ weather }: Props) {
    const sessions = useMemo(() => Object.keys(weather), [weather]);
    const defaultSession = sessions.includes("Race") ? "Race" : sessions[sessions.length - 1];
    const [selected, setSelected] = useState(defaultSession);
    const activeSession = sessions.includes(selected) ? selected : defaultSession;
    const hourly = weather[activeSession];
    const hours = useMemo(() => Array.from({ length: hourly.hour.length }), [hourly.hour.length]);

    if (!hourly) return <p className="text-zinc-500 dark:text-zinc-400 text-sm">No data available, try refreshing.</p>;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Weather</p>
                <div className="flex flex-wrap justify-end">
                    {sessions.map(s => (
                        <button
                            key={s}
                            onClick={() => setSelected(s)}
                            aria-pressed={selected === s}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${selected === s
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
            <div className="flex flex-1 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden ">

                {/* Row label column */}
                <div className="flex flex-col shrink-0 border-zinc-200 dark:border-zinc-700">
                    {ROWS.map((row, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-1.5 px-3 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-400 whitespace-nowrap ${i < ROWS.length - 1 ? "border-b border-zinc-200 dark:border-zinc-700" : ""}`}
                            style={{ height: row.height }}
                        >
                            {row.icon}
                            {i > 0 && <>({row.text})</>}
                        </div>
                    ))}
                </div>

                {/* Hour columns */}
                {hours.map((_, i) => {
                    const hourDate = new Date(hourly.hour[i] + "Z");
                    const isStart = i === 2;
                    const rainPct = hourly.precipitationProbability[i];
                    const dir = hourly.windDirection[i];

                    return (
                        <div
                            key={i}
                            className={`flex flex-col flex-1 ${isStart
                                ? "bg-red-600/10 dark:bg-red-600/20 border rounded border-red-600"
                                : "border-l border-zinc-200 dark:border-zinc-700"}`}
                        >
                            {/* Time */}
                            <div
                                className={`flex items-center justify-center text-xs font-medium border-b border-zinc-200 dark:border-zinc-700 ${isStart ? "text-zinc-700 dark:text-white font-bold bg-red-600/10 dark:bg-red-600/20" : "text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900"}`}
                                style={{ height: ROWS[0].height }}
                            >
                                {hourDate.getHours()}:00
                            </div>

                            {/* Temp */}
                            <div
                                className="flex items-center justify-center text-base font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-700"
                                style={{ height: ROWS[1].height }}
                            >
                                {Math.round(hourly.temperature[i])}°
                            </div>

                            {/* Rain */}
                            <div
                                className="flex flex-col items-center justify-center gap-1.5 px-2 border-b border-zinc-200 dark:border-zinc-700"
                                style={{ height: ROWS[2].height }}
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
                                style={{ height: ROWS[3].height }}
                            >
                                {hourly.precipitation[i].toFixed(1)}
                            </div>

                            {/* Wind */}
                            <div
                                className="flex flex-col items-center justify-center gap-0.5"
                                style={{ height: ROWS[4].height }}
                            >
                                <span className="text-xs font-medium text-zinc-900 dark:text-white">
                                    {Math.round(hourly.windSpeed[i])}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-zinc-400">
                                    <span style={{ display: "inline-block", transform: `rotate(${dir + 180}deg)`, fontSize: "11px", lineHeight: 1 }}>↑</span>
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








































