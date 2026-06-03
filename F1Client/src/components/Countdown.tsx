import { useState, useEffect } from "react";

interface CountDownProps {
    name: string;
    sessionDateTime: string;
}

function useCountdown(target: string | undefined) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!target) return;
        const update = () => setTimeLeft(new Date(target).getTime() - Date.now());
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [target]);

    return timeLeft;
}

function formatCountdown(ms: number) {
    if (ms <= 0) return "Live now";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function CountDown({ name, sessionDateTime }: CountDownProps) {
    const timeLeft = useCountdown(sessionDateTime);
    const isRace = name.toLowerCase().includes("prix");

    return (
        <div className="rounded-xl border-2 border-red-600 p-4 bg-white dark:bg-zinc-800 text-center">
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">
                {isRace ? "Race" : "Next session"}
            </p>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">{name}</h4>
            <p className="text-2xl font-bold text-red-600 mb-1">{formatCountdown(timeLeft)}</p>
            <p className="text-xs text-zinc-400">{new Date(sessionDateTime).toLocaleString()}</p>
        </div>
    );
}