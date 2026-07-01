import { useEffect, useState } from "react";

interface QualifyingResultEntry {
    position: number;
    driver: string;
    team: string;
    q1: string;
    q2: string;
    q3: string;
}

interface Props {
    year: number;
    round: number;
    session: string;
}

export default function QualifyingResultsTable({ year, round, session }: Props) {
    const [results, setResults] = useState<QualifyingResultEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const hasQ2 = results.some(e => e.q2);
    const hasQ3 = results.some(e => e.q3);

    useEffect(() => {
        let cancelled = false;

        fetch(`/api/race/${year}/${round}/results/${session}`)
            .then(res => res.json())
            .then(data => {
                if (!cancelled) {
                    setResults(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
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
                    <th className="pb-2 pr-4 text-right">{hasQ2 ? "Q1" : "Time"}</th>
                    {hasQ2 && <th className="pb-2 pr-4 text-right">Q2</th>}
                    {hasQ3 && <th className="pb-2 text-right">Q3</th>}
                </tr>
            </thead>
            <tbody>
                {results.map(entry => (
                    <tr
                        key={`${entry.position}`}
                        className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <td className="py-2 pr-4 font-mono text-zinc-400">{entry.position}</td>
                        <td className="py-2 pr-8 font-semibold text-zinc-900 dark:text-white">{entry.driver}</td>
                        <td className="py-2 pr-8 text-zinc-500 dark:text-zinc-400">{entry.team}</td>
                        <td className="py-2 pr-4 text-right font-mono text-zinc-600 dark:text-zinc-300">{entry.q1}</td>
                        {hasQ2 && <td className="py-2 pr-4 text-right font-mono text-zinc-600 dark:text-zinc-300">{entry.q2}</td>}
                        {hasQ3 && <td className="py-2 text-right font-mono text-zinc-600 dark:text-zinc-300">{entry.q3}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
