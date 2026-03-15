import React from "react";

export interface DriverStandingDto {
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

interface Props {
    standings: DriverStandingDto[];
    year?: number;
}

export default function DriverStandingsTable({ standings, year }: Props) {
    const currentYear = new Date().getFullYear();

    if (standings.length === 0) return <p>Season {year ?? currentYear} hasn't started yet.</p>;

    return (
        <div className="d-flex flex-column align-items-centre">
            <h2>Drivers Standings ({year ?? currentYear})</h2>
            <table className="table w-auto">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th className="text-start">Driver</th>
                        <th className="text-start">Team</th>
                        <th>Points</th>
                        <th>Wins</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map(driver => (
                        <tr key={driver.driverId}>
                            <td className="text-center">
                                {driver.position === 1 && <i className="bi bi-award-fill text-warning"> 1</i>}
                                {driver.position === 2 && <i className="bi bi-award-fill text-secondary"> 2</i>}
                                {driver.position === 3 && <i className="bi bi-award-fill" style={{ color: "#cd7f32" }}> 3</i>}
                                {driver.position > 3 && driver.position}
                            </td>
                            <td className="text-start">{driver.name}</td>
                            <td className="text-start">{driver.constructor}</td>
                            <td className="text-centre">{driver.points}</td>
                            <td className="text-centre">{driver.wins}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}