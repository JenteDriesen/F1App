import { useEffect, useState } from "react";

interface PodiumEntry {
    position: number;
    driver: string;
    team: string;
}

interface Props {
    circuitId: string;
}

const POSITION_STYLES = {
    1: { height: "h-28", label: "🥇" },
    2: { height: "h-20", label: "🥈" },
    3: { height: "h-14", label: "🥉" },
};

export default function LastYearPodium({ circuitId }: Props) {
    const [podium, setPodium] = useState<PodiumEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetch(`/api/race/${circuitId}/lastYearPodium`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data: PodiumEntry[]) => {
                if (!cancelled) {
                    setPodium(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [circuitId]);

    if (loading) return <div className="text-zinc-400 animate-pulse text-sm">Loading podium...</div>;
    if (error || podium.length === 0) return <div className="text-zinc-400 text-sm">No data available.</div>;

    return (
        <div className="flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-zinc-400">Last year's podium</p>

            <div className="flex items-end justify-center gap-2 py-10">
                {[2, 1, 3].map(pos => {
                    const entry = podium.find(p => p.position === pos);
                    if (!entry) return null;
                    const style = POSITION_STYLES[pos as keyof typeof POSITION_STYLES];

                    return (
                        <div key={pos} className="flex flex-col items-center gap-2 w-24">
                            <div className="text-center">
                                <p className="font-semibold text-sm text-zinc-900 dark:text-white leading-tight">{entry.driver}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{entry.team}</p>
                            </div>
                            <div className={`${style.height} w-24 bg-zinc-100 dark:bg-zinc-700 rounded-t-lg flex items-center justify-center border-t-2 border-red-600`}>
                                <span className="text-2xl">{style.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
