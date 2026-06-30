import { useEffect, useState } from "react";

interface RaceResultEntry {
    position: number;
    driver: string;
    team: string;
    time: string;
    points: number;
    fastestLap: boolean;
}

interface Props {
    year: number;
    round: number;
    session: string;
}

export default function RaceResultsTable({ year, round, session }: Props) {
    const [results, setResults] = useState<RaceResultEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/race/${year}/${round}/results/${session}`)
            .then(res => res.json())
            .then((data) => {
                setResults(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [year, round, session]);

    if (loading) return <div className="text-zinc-400 animate-pulse">Fetching results...</div>;
    if (results.length === 0) return <div className="text-zinc-400">No results available.</div>;

    return (
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
                    <tr
                        key={entry.position}
                        className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <td className="py-2 pr-4 font-mono">
                            {entry.position === 1 ? <span className="text-yellow-400 font-bold">1</span>
                                : entry.position === 2 ? <span className="text-zinc-400 font-bold">2</span>
                                    : entry.position === 3 ? <span className="text-amber-600 font-bold">3</span>
                                        : <span className="text-zinc-400">{entry.position}</span>}
                        </td>
                        <td className="py-2 pr-8 flex items-center gap-2">
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
    );
}
