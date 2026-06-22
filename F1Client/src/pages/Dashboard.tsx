import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DriverStandingsTable, { type DriverStandingDto } from "../components/DriversStandingsTable";
import CountDownSessionRace, { type Session } from '../components/CountdownSessionRace';

interface SessionRaceData {
    nextSession: Session;
    nextRace: Session;
}

const fetchWithRetry = <T,>(url: string, retries = 3, delay = 500): Promise<T> =>
    fetch(url).then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<T>;
    }).catch(err => {
        if (retries === 0) throw err;
        return new Promise<T>(resolve => setTimeout(resolve, delay))
            .then(() => fetchWithRetry<T>(url, retries - 1, delay));
    });

export default function Dashboard() {
    const [standings, setStandings] = useState<DriverStandingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextRace, setNextRace] = useState<Session | null>(null);
    const [nextSession, setNextSession] = useState<Session | null>(null);

    useEffect(() => {
        Promise.all([
            fetchWithRetry<DriverStandingDto[]>("/api/standings"),
            fetchWithRetry<SessionRaceData>("/api/race/nextSessionRace"),
        ]).then(([standingsData, sessionData]) => {
            setStandings(standingsData);
            setNextSession(sessionData.nextSession);
            setNextRace(sessionData.nextRace);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading dashboard...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 py-6">
            <div className="flex-1 min-w-0">
                <Link to="/DriversStandings" className="block h-full no-underline">
                    <div className="h-full rounded-xl border-2 border-red-600 p-4 bg-white dark:bg-zinc-800 hover:shadow-md transition-shadow">
                        <DriverStandingsTable standings={standings} />
                    </div>
                </Link>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <Link to="/NextRace" className="no-underline">
                    <CountDownSessionRace nextSession={nextSession} nextRace={nextRace} />
                </Link>
            </div>
        </div>
    );
}