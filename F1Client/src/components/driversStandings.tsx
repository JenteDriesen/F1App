import { useState, useEffect } from "react";

interface DriverStandingDto {
    position: number;
    points: number;
    wins: number;
    driverId: string;
    code: string;
    name: string;
    nationality: string;
    constructor: string;
    constructorNationality: string;
    wikiUrl: string;
}

export default function DriversStandings() {
    const [year, setYear] = useState<number | null>(null);
    const [race, setRace] = useState<number | null>(null);
    const [standings, setStandings] = useState<DriverStandingDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/standings")
            .then(res => res.json())
            .then(data => {
                setStandings(data);
                setLoading(false);
            });
    }, []);

    const handleApply = () => {
        setLoading(true);

        const params = new URLSearchParams();
        if (year) params.append("year", year.toString());
        if (race) params.append("race", race.toString());

        const url = params.toString() ? `/api/standings?${params.toString()}` : "/api/standings";

        fetch(url)
            .then(res => {
                if (!res.ok) {
                    setStandings([]);
                    throw new Error("Failed to fetch driver standings");
                }
                return res.json();
            })
            .then(data => setStandings(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Drivers WDC </h1>

            <div>
                <label>Year: </label>
                <input
                    type="number"
                    value={year ?? ""}
                    min={1950}
                    onChange={e => setYear(Number(e.target.value))}
                    placeholder="Choose year"
                />
                <label>Race: </label>
                <input
                    type="number"
                    value={race ?? ""}
                    min={0}
                    onChange={e => {
                        const val = e.target.value;
                        setRace(val === "0" ? null : Number(val));
                    }}
                    placeholder="Choose race (0 for last race)"
                />
                <button onClick={handleApply}> Apply </button>
            </div>
            {standings.length === 0
                ? <p>This season doesnt exist (yet).</p>
                : <table>
                    <thead>
                        <tr>
                            <th>Pos </th>
                            <th> Driver </th>
                            <th> Team </th>
                            <th> Points </th>
                            <th> Wins </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            standings.map(driver => (
                                <tr key={driver.driverId} >
                                    <td>{driver.position} </td>
                                    <td> {driver.name} </td>
                                    <td> {driver.constructor} </td>
                                    <td> {driver.points} </td>
                                    <td> {driver.wins} </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}