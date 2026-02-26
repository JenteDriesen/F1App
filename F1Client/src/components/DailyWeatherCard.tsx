
interface DailyWeather {
    date: string;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    windMax: number;
}

export default function DailyWeatherCard({ day }: { day: DailyWeather }) {
    const d = new Date(day.date);
    return (
        <div className="card text-center me-2" style={{ minWidth: 100, padding: 8 }}>
            <p className="mb-1">{d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</p>
            <p className="mb-1">🌡 {day.tempMin}–{day.tempMax}°C</p>
            <p className="mb-1">💧 {day.precipitation} mm</p>
            <p className="mb-0">💨 {day.windMax} m/s</p>
        </div>
    );
}