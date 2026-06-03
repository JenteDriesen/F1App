import { useState, useEffect } from "react";
import DriverStandingsTable, { type DriverStandingDto } from "../components/DriversStandingsTable";

export default function DriversStandingsPage() {
    const [year, setYear] = useState<number | null>(null);
    const [race, setRace] = useState<number | null>(null);
    const [standings, setStandings] = useState<DriverStandingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        fetch("/api/standings")
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

        const url = params.toString() ? `/api/standings?${params.toString()}` : "/api/standings";

        fetch(url)
            .then(res => {
                if (!res.ok) { setStandings([]); throw new Error("Failed to fetch"); }
                return res.json();
            })
            .then(data => setStandings(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    if (loading) return <div className="text-zinc-500 dark:text-zinc-400 p-8">Loading...</div>;

    return (
        <div className="flex gap-8 py-6">
            <aside className="w-48 shrink-0 border-r border-zinc-200 dark:border-zinc-700 pr-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400">Year</label>
                    <input
                        type="number"
                        value={year ?? ""}
                        min={1950}
                        max={currentYear}
                        placeholder={String(currentYear)}
                        onChange={e => setYear(Number(e.target.value))}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400">Round</label>
                    <input
                        type="number"
                        value={race ?? ""}
                        min={0}
                        placeholder="Last"
                        onChange={e => {
                            const val = e.target.value;
                            setRace(val === "0" ? null : Number(val));
                        }}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                </div>

                <button
                    onClick={handleApply}
                    className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                    Apply
                </button>
            </aside>

            <div className="flex-1 min-w-0">
                <DriverStandingsTable standings={standings} year={year ?? currentYear} />
            </div>
        </div>
    );
}