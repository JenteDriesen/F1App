import { useState, useEffect } from "react";

interface CountDownProps {
    name: string;
    sessionDateTime: string;
}

function UseCountdown(target: string | undefined) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!target) return;

        const update = () => {
            const diff = new Date(target).getTime() - Date.now();
            setTimeLeft(diff);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [target]);

    return timeLeft;
}

function FormatCountdown(ms: number) {
    if (ms <= 0) return "Live now";

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function CountDown({ name, sessionDateTime }: CountDownProps) {

    const nextSessionCountdown = UseCountdown(sessionDateTime);

    return (
        <div className="container my-4 text-center">

            <div className="card p-3 mb-3">
                <h4>Next session ({name}) starts in</h4>
                <div className="fs-4 fw-semibold">
                    {FormatCountdown(nextSessionCountdown)}
                </div>
                <small className="text-muted">
                    ({new Date(sessionDateTime).toLocaleString()})
                </small>
            </div>
        </div>
    );
}