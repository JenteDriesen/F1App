import { useState, useEffect } from "react";
import MiniMap from "../components/MiniMap";
import WeatherWidget from "../components/WeatherWidget";
import CountDown from "../components/Countdown";


interface Session {
    name: string;
    sessionDateTime: string;
}

interface LoactionInfo {
    latitude: number;
    longitude: number;
    locality: string;
    country: string;
}

interface CircuitInfo {
    id: string;
    name: string;
    location: LoactionInfo;
}

interface WeekendInfo {
    season: number;
    round: number;
    circuit: CircuitInfo;
    raceDateTime: string;
    sessions: Session[];
}

export default function NextWeekendInfoPage() {
    const [loading, setLoading] = useState(true);
    const [nextRace, setNextRace] = useState<Session | null>(null);
    const [nextSession, setNextSession] = useState<Session | null>(null);
    const [nextWeekendInfo, setNextWeekendInfo] = useState<WeekendInfo | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/race/nextSessionRace").then(res => res.json()),
            fetch("/api/race/nextRaceweekend").then(res => res.json()),
            fetch
        ]).then(([sessionRaceData, weekendData]) => {
            setNextSession(sessionRaceData.nextSession);
            setNextRace(sessionRaceData.nextRace);
            setNextWeekendInfo(weekendData);
            setLoading(false);
        });
    }, []);

    const lat = nextWeekendInfo?.circuit.location.latitude ?? 0;
    const lng = nextWeekendInfo?.circuit.location.longitude ?? 0;

    if (loading) return <div>Loading...</div>;

    if (!nextWeekendInfo) {
        return <p>Not found.</p>;
    }

    return (
        <div className="container-fluid py-4">
            <div className="mb-4 text-center">
                <h2>{nextWeekendInfo.circuit.name} ({nextWeekendInfo.season})</h2>
            </div>

            <div className="row g-4">
                {nextSession && nextRace && nextSession.sessionDateTime !== nextRace.sessionDateTime && (

                    <div className="col-md-auto">
                        <CountDown name={nextSession?.name} sessionDateTime={nextSession?.sessionDateTime} />
                    </div>)}

                {nextRace && (

                    <div className="col-md-auto">
                        <CountDown name={nextRace?.name} sessionDateTime={nextRace?.sessionDateTime} />
                    </div>
                )}
            </div>

            <div className="row g-4">
                <div className="col-md-9">
                    <WeatherWidget />
                </div>

                <div className="col-md-3 d-flex flex-column align-items-center">
                    <div className="mt-3 w-100">
                        <MiniMap lat={lat} lng={lng} />
                    </div>
                </div>

            </div>
        </div>
    );
}