import { useEffect, useState } from "react";

interface Weekend {
    name: string;
    round: number;
    sessions: string[];
}

interface ResultEntry {
    position: number;
    driver: string;
    team: string;
    teamColor: string;
    time: string;
    points: number;
    fastestLap?: boolean;
}

const currentYear = new Date().getFullYear();

export default function ResultPage() {
    const [weekends, setWeekends] = useState<Weekend[]>([]);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<ResultEntry[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);

    const [year, setYear] = useState<number>(currentYear);
    const [yearInput, setYearInput] = useState<string>(String(currentYear));
    const [roundInput, setRoundInput] = useState<string>("");
    const [selectedRound, setSelectedRound] = useState<number | null>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/race/${year}`)
            .then(res => res.json())
            .then((data: Weekend[]) => {
                setWeekends(data);
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    setSelectedRound(latest.round);
                    setSelectedSession(latest.sessions[latest.sessions.length - 1]);
                }
                setLoading(false);
            });

        return () => setLoading(true);
    }, [year]);

    useEffect(() => {
        if (selectedRound === null || selectedSession === null) return;

        fetch(`/api/race/${year}/${selectedRound}/${selectedSession}`)
            .then(res => res.json())
            .then((data: ResultEntry[]) => {
                setResults(data);
                setResultsLoading(false);
            });

        return () => setResultsLoading(true);
    }, [year, selectedRound, selectedSession]);

    const handleApply = () => {
        const parsedYear = Number(yearInput);
        const resolvedYear = Math.min(currentYear, Math.max(1950, parsedYear || currentYear));
        setYear(resolvedYear);
        setYearInput(String(resolvedYear));

        if (roundInput) {
            const round = Math.max(1, Number(roundInput));
            setSelectedRound(round);
            const weekend = weekends.find(w => w.round === round);
            if (weekend) setSelectedSession(weekend.sessions[weekend.sessions.length - 1]);
        }
    };

    const selectedWeekend = weekends.find(w => w.round === selectedRound);

    const inputClass = "w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500";

    return (
        <div className="py-6 min-h-screen">
            <aside className="w-48 shrink-0 border-r border-zinc-200 dark:border-zinc-700 pr-4 flex flex-col gap-4 fixed top-20 bottom-4 left-6">
                <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400">Year</label>
                    <input
                        type="number"
                        value={yearInput}
                        min={1950}
                        max={currentYear}
                        onChange={e => setYearInput(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400">Round</label>
                    <input
                        type="number"
                        value={roundInput}
                        min={1}
                        placeholder="Last"
                        onChange={e => setRoundInput(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <button
                    onClick={handleApply}
                    className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                    Apply
                </button>

                {selectedWeekend && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest text-zinc-400">Session</label>
                        {selectedWeekend.sessions.map(session => (
                            <button
                                key={session}
                                onClick={() => setSelectedSession(session)}
                                className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedSession === session
                                    ? "bg-red-600 text-white"
                                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                                    }`}
                            >
                                {session}
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            <div className="flex-1 min-w-0 ml-56">
                {selectedWeekend && (
                    <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                        <p className="text-xs uppercase tracking-widest text-red-600 mb-1">
                            Round {selectedWeekend.round} · {selectedSession}
                        </p>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{selectedWeekend.name}</h1>
                    </div>
                )}

                {loading ? (
                    <div className="text-zinc-400 animate-pulse">Loading races...</div>
                ) : resultsLoading ? (
                    <div className="text-zinc-400 animate-pulse">Fetching results...</div>
                ) : results.length === 0 ? (
                    <div className="text-zinc-400">No results available.</div>
                ) : (
                    <table className="w-auto text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                                <th className="pb-2 pr-4 text-left">Pos</th>
                                <th className="pb-2 pr-8 text-left">Driver</th>
                                <th className="pb-2 pr-8 text-left">Team</th>
                                <th className="pb-2 pr-4 text-right">Time</th>
                                <th className="pb-2 text-right">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(entry => (
                                <tr key={entry.position} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <td className="py-2 pr-4 font-mono text-zinc-400">{entry.position}</td>
                                    <td className="py-2 pr-8 flex items-center gap-2">
                                        <span className="w-1 h-5 rounded-full inline-block shrink-0" style={{ background: entry.teamColor }} />
                                        <span className="font-semibold text-zinc-900 dark:text-white">{entry.driver}</span>
                                        {entry.fastestLap && <span className="text-purple-400 text-xs">⬤</span>}
                                    </td>
                                    <td className="py-2 pr-8 text-zinc-500 dark:text-zinc-400">{entry.team}</td>
                                    <td className="py-2 pr-4 text-right font-mono text-zinc-600 dark:text-zinc-300">{entry.time}</td>
                                    <td className="py-2 text-right font-semibold text-zinc-900 dark:text-white">{entry.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}