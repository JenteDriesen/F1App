import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DriverStandingsTable, { type DriverStandingDto } from "../components/DriversStandingsTable";
import CountDownSessionRace from '../components/CountdownSessionRace';

export default function Dashboard() {
    const [standings, setStandings] = useState<DriverStandingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextRace, setNextRace] = useState();
    const [nextSession, setNextSession] = useState();

    useEffect(() => {
        fetch("/api/race/nextSessionRace")
            .then(res => res.json())
            .then(data => {
                setNextSession(data.nextSession);
                setNextRace(data.nextRace);
            });
    }, []);

    useEffect(() => {
        fetch("/api/standings")
            .then(res => res.json())
            .then(data => setStandings(data))
            .finally(() => setLoading(false));
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
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Next up</h3>
                <Link to="/NextRace" className="no-underline">
                    <CountDownSessionRace nextSession={nextSession ?? null} nextRace={nextRace ?? null} />
                </Link>
            </div>
        </div>
    );
}