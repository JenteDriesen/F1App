import { useState, useEffect } from "react";
import CountDownSessionRace from "../components/CountdownSessionRace";

interface Session {
    name: string;
    sessionDateTime: string;
}

export default function CountDownPage() {
    const [loading, setLoading] = useState(true);
    const [nextRace, setNextRace] = useState<Session>();
    const [nextSession, setNextSession] = useState<Session>();

    useEffect(() => {
        fetch("/api/race/nextSessionRace")
            .then(res => res.json())
            .then(data => {
                setNextSession(data.nextSession);
                setNextRace(data.nextRace);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <CountDownSessionRace nextSession={nextSession} nextRace={nextRace} />
            <p>info...</p>
        </div>
    );
}