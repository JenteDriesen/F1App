import { useEffect, useRef, useState } from "react";
import RaceResultsTable from "../components/RaceResultsTable";
import QualifyingResultsTable from "../components/QualifyingResultsTable";

interface Weekend {
    name: string;
    round: number;
    sessions: string[];
}

const currentYear = new Date().getFullYear();

export default function ResultPage() {
    const [weekends, setWeekends] = useState<Weekend[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState<number>(currentYear);
    const [yearInput, setYearInput] = useState<string>(String(currentYear));
    const [roundInput, setRoundInput] = useState<string>("");
    const [selectedRound, setSelectedRound] = useState<number | null>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);

    const pendingRoundRef = useRef<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch(`/api/race/${year}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data: Weekend[]) => {
                if (cancelled) return;
                setWeekends(data);
                if (pendingRoundRef.current !== null) {
                    const weekend = data.find(w => w.round === pendingRoundRef.current);
                    setSelectedRound(pendingRoundRef.current);
                    setSelectedSession(weekend?.sessions.at(-1) ?? null);
                    pendingRoundRef.current = null;
                } else if (data.length > 0) {
                    const latest = data[data.length - 1];
                    setSelectedRound(latest.round);
                    setSelectedSession(latest.sessions.at(-1) ?? null);
                }
                setLoading(false);
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            setLoading(true);
        };
    }, [year]);

    const handleApply = () => {
        const parsedYear = Number(yearInput);
        const resolvedYear = Math.min(currentYear, Math.max(1950, parsedYear || currentYear));
        setYear(resolvedYear);
        setYearInput(String(resolvedYear));

        if (roundInput) {
            const round = Math.max(1, Number(roundInput));
            if (resolvedYear === year) {
                const weekend = weekends.find(w => w.round === round);
                setSelectedRound(round);
                setSelectedSession(weekend?.sessions.at(-1) ?? null);
            } else {
                pendingRoundRef.current = round;
            }
        }
    };

    const selectedWeekend = weekends.find(w => w.round === selectedRound);
    const inputClass = "w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500";

    const isQualifying = selectedSession?.toLowerCase().includes("qualifying");
    const isRace = selectedSession === "Race" || selectedSession === "Sprint";

    return (
        <div className="py-6 min-h-screen flex gap-8 items-start">
            {/* Sidebar */}
            <aside className="w-44 shrink-0 border-r border-zinc-200 dark:border-zinc-700 pr-4 flex flex-col gap-4 sticky top-20 bottom-4 self-start min-h-[calc(100vh-6rem)]">
                <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400">Year</label>
                    <input
                        type="number"
                        value={yearInput}
                        min={1950}
                        max={currentYear}
                        onChange={e => setYearInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApply();
                            }
                        }}
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApply();
                            }
                        }}
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
                        {["Qualifying", "Sprint", "Race"]
                            .filter(s => s !== "Sprint" || selectedWeekend.sessions.includes("Sprint"))
                            .map(session => (
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
                            ))
                        }
                    </div>
                )}
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 overflow-x-auto mx-auto max-w-3xl">
                {selectedWeekend && (
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-widest text-red-600 mb-1">
                            Round {selectedWeekend.round} · {selectedSession}
                        </p>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{selectedWeekend.name}</h1>
                    </div>
                )}

                {loading ? (
                    <div className="text-zinc-400 animate-pulse">Loading races...</div>
                ) : !selectedSession ? (
                    <div className="text-zinc-400">
                        {weekends.some(w => w.round === selectedRound)
                            ? "Select a session to view results."
                            : "No results available for this round."}
                    </div>
                ) : isQualifying ? (
                    <QualifyingResultsTable year={year} round={selectedRound!} session={selectedSession} />
                ) : isRace ? (
                    <RaceResultsTable year={year} round={selectedRound!} session={selectedSession} />
                ) : (
                    <div className="text-zinc-400">No results available for this session.</div>
                )}
            </div>
        </div>
    );
}
