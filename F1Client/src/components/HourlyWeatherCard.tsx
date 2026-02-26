interface HourlyWeather {
    time: Date;
    temp: number;
    precipitation: number;
    wind: number;
}

export default function HourlyWeatherCard({ hour }: { hour: HourlyWeather }) {
    return (
        <div className="card text-center me-2" style={{ minWidth: 60, padding: 8 }}>
            <p className="mb-1">{hour.time.getHours()}:00</p>
            <p className="mb-1">🌡 {hour.temp}°C</p>
            <p className="mb-1">💧 {hour.precipitation} mm</p>
            <p className="mb-0">💨 {hour.wind} m/s</p>
        </div>
    );
}