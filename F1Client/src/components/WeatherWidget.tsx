import { useEffect, useState } from "react";

interface DailyApiResponse {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
    rain_sum: number[];
    showers_sum: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    precipitation_hours: number[];
}

interface HourlyWeather {
    time: Date;
    temp: number;
    precipitation: number;
    wind: number;
}

interface Session {
    name: string;
    sessionDateTime: string;
}

interface RaceWeekendWeatherProps {
    lat: number;
    lng: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
}

export default function RaceWeekendWeather({ lat, lng, startDate, endDate }: RaceWeekendWeatherProps) {
    const [daily, setDaily] = useState<DailyApiResponse>();
    const [hourly, setHourly] = useState<HourlyWeather[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWeather() {
            setLoading(true);

            const params = new URLSearchParams({
                latitude: lat.toString(),
                longitude: lng.toString(),
                daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,precipitation_probability_max",
                hourly: "temperature_2m,precipitation,wind_speed_10m",
                start_date: startDate,
                end_date: endDate,
                timezone: "auto",
            });

            const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
            const res = await fetch(url);
            const data = await res.json();

            setDaily(data.daily)
            setLoading(false);
        }

        fetchWeather();
    }, [lat, lng, startDate, endDate]);

    const dailyData: DailyWeather[] = dailyObj.time.map((date, i) => ({
        date,
        tempMax: dailyObj.temperature_2m_max[i],
        tempMin: dailyObj.temperature_2m_min[i],
        precipitation: dailyObj.precipitation_sum[i],
        windMax: dailyObj.wind_speed_10m_max[i],
        weatherCode: dailyObj.precipitation_probability_max[i],
    }));

    if (loading) return <p>Loading weekend weather...</p>;

    return (
        <div className="card">
            {daily.time[0]}
        </div>
    );
}