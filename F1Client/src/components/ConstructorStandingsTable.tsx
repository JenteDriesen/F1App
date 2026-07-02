
export interface ConstructorStandingDto {
    position: number;
    points: number;
    wins: number;
    constructorId: string;
    name: string;
    nationality: string;
    wikiUrl: string;
}

interface Props {
    standings: ConstructorStandingDto[];
    year?: number;
}

export default function ConstructorStandingsTable({ standings, year }: Props) {
    const currentYear = new Date().getFullYear();

    if (standings.length === 0)
        return <p className="text-zinc-500 dark:text-zinc-400">
            {year && year < currentYear ? `No data available for the ${year} season.` : `Season ${year ?? currentYear} hasn't started yet.`}</p>;

    return (
        <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-red-600 mb-1">
                {year ?? currentYear}
            </p>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Constructors Championship</h2>
            <table className="w-full max-w-2xl text-sm">
                <thead>
                    <tr className="text-xs uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                        <th className="pb-2 pr-4 text-left">Pos</th>
                        <th className="pb-2 pr-8 text-left">Constructor</th>
                        <th className="pb-2 pr-8 text-left">Nationality</th>
                        <th className="pb-2 pr-4 text-right">Points</th>
                        <th className="pb-2 text-right">Wins</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map(constructor => (
                        <tr key={constructor.constructorId} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <td className="py-2 pr-4 font-mono">
                                {constructor.position === 1 ? <span className="text-yellow-400 font-bold">1</span>
                                    : constructor.position === 2 ? <span className="text-zinc-400 font-bold">2</span>
                                        : constructor.position === 3 ? <span className="text-amber-600 font-bold">3</span>
                                            : <span className="text-zinc-400">{constructor.position}</span>}
                            </td>
                            <td className="py-2 pr-8 font-semibold text-zinc-900 dark:text-white">{constructor.name}</td>
                            <td className="py-2 pr-8 text-zinc-500 dark:text-zinc-400">{constructor.nationality}</td>
                            <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{constructor.points}</td>
                            <td className="py-2 text-right text-zinc-500 dark:text-zinc-400">{constructor.wins}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}