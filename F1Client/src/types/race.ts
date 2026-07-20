export interface Session {
    name: string;
    sessionDateTime: string;
}

export interface LocationInfo {
    latitude: number;
    longitude: number;
    locality: string;
    country: string;
}

export interface CircuitInfo {
    id: string;
    name: string;
    location: LocationInfo;
}

export interface WeekendInfo {
    season: number;
    round: number;
    circuit: CircuitInfo;
    raceDateTime: string;
    sessions: Session[];
}

export interface SessionWeather {
    hour: string[];
    temperature: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeed: number[];
    windDirection: number[];
}