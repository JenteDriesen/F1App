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

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function DriverStandingsTable({ standings, year }: Props) {
    const currentYear = new Date().getFullYear();

    if (standings.length === 0) return <p className="text-zinc-500 dark:text-zinc-400">Season {year ?? currentYear} hasn't started yet.</p>;

    return (
        <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-red-600 mb-1">
                {year ?? currentYear}
            </p>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Drivers Championship</h2>
            <table className="w-full max-w-2xl text-sm">
                <thead>
                    <tr className="text-xs uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                        <th className="pb-2 pr-4 text-left">Pos</th>
                        <th className="pb-2 pr-8 text-left">Driver</th>
                        <th className="pb-2 pr-8 text-left">Team</th>
                        <th className="pb-2 pr-4 text-right">Points</th>
                        <th className="pb-2 text-right">Wins</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map(driver => (
                        <tr key={driver.driverId} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <td className="py-2 pr-4 font-mono text-zinc-500 dark:text-zinc-400">
                                {MEDAL[driver.position] ?? driver.position}
                            </td>
                            <td className="py-2 pr-8 font-semibold text-zinc-900 dark:text-white">{driver.name}</td>
                            <td className="py-2 pr-8 text-zinc-500 dark:text-zinc-400">{driver.constructor}</td>
                            <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{driver.points}</td>
                            <td className="py-2 text-right text-zinc-500 dark:text-zinc-400">{driver.wins}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}