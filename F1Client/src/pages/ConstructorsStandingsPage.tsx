import { useState, useEffect } from "react";
import ConstructorStandingsTable, { type ConstructorStandingDto } from "../components/ConstructorStandingsTable";

export default function ConstructorsStandingsPage() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState<number>(currentYear);
    const [race, setRace] = useState<number | null>(null);
    const [standings, setStandings] = useState<ConstructorStandingDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/standings/WCC")
            .then(res => res.json())
            .then(data => {
                setStandings(data);
                setLoading(false);
            });
    }, []);

    const handleApply = () => {
        setLoading(true);

        const resolvedYear = (!year || year <= 0) ? currentYear : Math.max(1950, year);
        if (resolvedYear !== year) setYear(resolvedYear);

        const params = new URLSearchParams();
        if (year) params.append("year", resolvedYear.toString());
        if (race) params.append("race", race.toString());

        const url = params.toString() ? `/api/standings/WCC?${params.toString()}` : "/api/standings/WCC";

        fetch(url)
            .then(res => {
                if (!res.ok) { setStandings([]); throw new Error("Failed to fetch"); }
                return res.json();
            })
            .then(data => setStandings(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    if (loading) return <div className="text-zinc-500 dark:text-zinc-400 p-8"></div>;

    return (
        <div className="py-6 min-h-screen flex gap-8 items-start">
            <aside className="w-44 shrink-0 border-r border-zinc-200 dark:border-zinc-700 pr-4 flex flex-col gap-4 sticky top-20 bottom-4 self-start min-h-[calc(100vh-6rem)]">
                <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400">Year</label>
                    <input
                        type="number"
                        value={year}
                        min={1950}
                        max={currentYear}
                        onChange={e => setYear(Number(e.target.value) || currentYear)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApply();
                            }
                        }}
                        className="w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400">Round</label>
                    <input
                        type="number"
                        value={race ?? ""}
                        min={0}
                        placeholder="Last"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApply();
                            }
                        }}
                        onChange={e => {
                            const val = e.target.value;
                            setRace(val === "0" ? null : Number(val));
                        }}
                        className="w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                </div>

                <button
                    onClick={handleApply}
                    className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                    Apply
                </button>
            </aside>

            <div className="flex-1 min-w-0 overflow-x-auto mx-auto max-w-3xl">
                <ConstructorStandingsTable standings={standings} year={year ?? currentYear} />
            </div>
        </div>
    );
}