import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountDown from './CountDownPage';
import DriverStandingsTable, { type DriverStandingDto } from "../components/DriversStandingsTable";
import CountDownSessionRace from '../components/CountdownSessionRace';


export default function Dashboard() {
    const [standings, setStandings] = useState<DriverStandingDto[]>([]);
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

    useEffect(() => {
        // Fetch current driver standings
        fetch("/api/standings")
            .then(res => res.json())
            .then(data => setStandings(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="container-fluid py-4">
            <div className="row g-4">
                <div className="col-md-12 col-lg-7">
                    <Link to="/DriversStandings" className="text-decoration-none">
                        <div className="card shadow-sm border rounded-4 h-100 hover-card">
                            <div className="card-body">
                                <DriverStandingsTable standings={standings} />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="col-md-12 col-lg-5">
                    <Link to="/NextRace" className="text-decoration-none">
                        <CountDownSessionRace nextSession={nextSession} nextRace={nextRace} />
                    </Link>
                </div>
            </div>
        </div>
    );
}