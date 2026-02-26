import { useState, useEffect } from "react";
import CountDownSessionRace from "../components/CountdownSessionRace";
import MiniMap from "../components/MiniMap";
import WeatherWidget from "../components/WeatherWidget";


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

    /* const getWeather = async () => {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`);

        return await response.json();
    } */

    if (loading) return <div>Loading...</div>;

    if (!nextWeekendInfo) {
        return <p>Not found.</p>;
    }

    return (
        <div>
            <h2>{nextWeekendInfo.circuit.name} ({nextWeekendInfo.season})</h2>
            <CountDownSessionRace nextSession={nextSession ?? null} nextRace={nextRace ?? null} />
            <MiniMap lat={lat} lng={lng} />
            {/* {getWeather().map(day => (
                <div key={day.date} className="weather-card">
                    <strong>{day.label}</strong>
                    <div>{day.temp}°C</div>
                    <div>{day.desc}</div>
                </div>
            ))} */}

            <WeatherWidget lat={lat} lng={lng} startDate={nextWeekendInfo.sessions[0].sessionDateTime.split("T")[0]} endDate={nextWeekendInfo.raceDateTime.split("T")[0]} />
        </div>
    );
}