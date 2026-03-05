import { useState, useEffect } from "react";
import DriverStandingsTable, { type DriverStandingDto } from "../components/DriversStandingsTable";

export default function DriversStandingsPage() {
    const [year, setYear] = useState<number | null>(null);
    const [race, setRace] = useState<number | null>(null);
    const [standings, setStandings] = useState<DriverStandingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();

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

        if (year === 0 || year === null) {
            setYear(currentYear);
        }
        else if (year <= 1950) {
            setYear(1950);
        }

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
        <div className="container my-4" style={{ display: "grid", gridTemplateColumns: "220px 1fr 220px", justifyItems: "center", gap: "2rem" }}>
            <div className="p-4" style={{ width: "220px" }}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleApply();
                    }}
                    className="d-flex flex-column gap-3"
                >
                    <div>
                        <div className="d-flex flex-column align-items-start">
                            <label htmlFor="yearInput" className="form-label">Year:</label>
                            <input
                                type="number"
                                id="yearInput"
                                className="form-control border-danger"
                                value={year ?? ""}
                                min={1950}
                                placeholder="Choose year"
                                onChange={(e) => setYear(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="d-flex flex-column align-items-start">
                            <label htmlFor="raceInput" className="form-label">Race:</label>
                            <input
                                type="number"
                                id="raceInput"
                                className="form-control border-danger"
                                value={race ?? ""}
                                min={0}
                                placeholder="Race number (0 = last race)"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setRace(val === "0" ? null : Number(val));
                                }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-2">Apply</button>
                </form>
            </div>

            <div className="p-3" style={{ minWidth: "600px" }}>
                <DriverStandingsTable standings={standings} year={year ?? currentYear} />
            </div>

            <div></div>
        </div>
    );
}