import { useEffect, useState } from "react";
import DailyWeatherCard from "./DailyWeatherCard";
import { Card, Col, Row } from "react-bootstrap";
import HourlyWeatherCard from "./HourlyWeatherCard";

interface DailyApiResponse {
    date: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitationSum: number[];
    precipitationProbabilityMax: number[];
    precipitationHours: number[];
    windDirectionDominant: number[];
    windSpeedMax: number[];
}

interface HourlyApiRespone {
    hour: string[];
    temperature: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeed: number[];
    windDirection: number[];
}

export default function WeatherWidget() {
    const [daily, setDaily] = useState<DailyApiResponse>();
    const [hourly, setHourly] = useState<HourlyApiRespone>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/race/raceWeekendWeather")
                .then(res => res.json()),
            fetch("/api/race/raceDayWeather")
                .then(res => res.json())
        ]).then(([dailyData, hourlyData]) => {
            setDaily(dailyData);
            setHourly(hourlyData);
            setLoading(false);
        });
    }, []);


    if (loading) return <p>Loading weekend weather...</p>;

    return (
        <>
            <Card className="border-0 p-2">
                <Row className="g-3 mb-3 justify-content-center">
                    <Col xs="auto">
                        <DailyWeatherCard day={daily!} index={0} />
                    </Col>
                    <Col xs="auto">
                        <DailyWeatherCard day={daily!} index={1} />
                    </Col>
                </Row>
                <Row className="g-3 justify-content-center">
                    <HourlyWeatherCard hourly={hourly!} />
                </Row>
            </Card>
        </>
    );
}