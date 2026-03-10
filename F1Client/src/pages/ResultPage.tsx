import { useEffect, useState } from "react";

interface Weekend {
    name: string,
    round: number,
    sessions: string[]
}

export default function ResultPage() {
    const [weekends, setWeekends] = useState<Weekend[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        fetch(`/api/race/${year}`)
            .then(res => res.json())
            .then(data => {
                setWeekends(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        /* bouw verder uit, een zijbalk met dropdown year and race en  klikboxjes met de sessie die dan de juiste race ophaalt (default is laaste) */
        <div>
            <h1>Results</h1>
            <p>{weekends[0].name}</p>
            <p>{weekends[0].round}</p>
        </div>
    );
};
