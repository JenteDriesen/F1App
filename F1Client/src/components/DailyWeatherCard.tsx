import { Card, Col, Row } from "react-bootstrap";

interface DailyWeather {
    date: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitationSum: number[];
    precipitationProbabilityMax: number[];
    precipitationHours: number[];
    windDirectionDominant: number[];
    windSpeedMax: number[];
}

interface Props {
    day: DailyWeather;
    index: number;
}

export default function DailyWeatherCard({ day, index }: Props) {
    const date = new Date(day.date[index]);

    const max = Math.round(day.temperatureMax[index]);
    const min = Math.round(day.temperatureMin[index]);
    const rainChance = day.precipitationProbabilityMax[index];
    const rain = day.precipitationSum[index];
    const wind = day.windSpeedMax[index];
    const windDir = day.windDirectionDominant[index];

    return (
        <Card className="shadow-sm border-danger text-center p-2" style={{ width: "210px" }}>
            <Card.Body className="p-1">

                <Card.Subtitle className="text-muted mb-1">
                    {date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
                </Card.Subtitle>

                <Card.Title className="fw-bold mb-1">
                    {max}°
                    <span className="fs-6 text-muted"> / {min}°</span>
                </Card.Title>

                <Row className="small g-1 text-center">
                    <Col>🌧</Col>
                    <Col>{rain} mm</Col>
                    <Col>{rainChance}%</Col>
                </Row>

                <Row className="small g-1 text-center mt-1">
                    <Col>💨</Col>
                    <Col>{wind} km/h</Col>
                    <Col>
                        <span
                            style={{
                                display: "inline-block",
                                transform: `rotate(${windDir}deg)`
                            }}
                        >
                            ▲
                        </span>
                    </Col>
                </Row>
            </Card.Body>
        </Card>)
}
