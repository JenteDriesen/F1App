import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DriverStandingsTable, { type DriverStandingDto } from "../components/DriversStandingsTable";
import CountDownSessionRace, { type Session } from '../components/CountdownSessionRace';

export default function Dashboard() {
    const [standings, setStandings] = useState<DriverStandingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextRace, setNextRace] = useState<Session | null>(null);
    const [nextSession, setNextSession] = useState<Session | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/standings").then(res => res.json()),
            fetch("/api/race/nextSessionRace").then(res => res.json()),
        ]).then(([standingsData, sessionData]) => {
            setStandings(standingsData);
            setNextSession(sessionData.nextSession);
            setNextRace(sessionData.nextRace);
            setLoading(false);
        });
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