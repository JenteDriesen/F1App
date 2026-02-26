import CountDown from "./Countdown";

export interface Session {
    name: string;
    sessionDateTime: string;
}
interface NextSessionRace {
    nextSession: Session | null;
    nextRace: Session | null;
}

export default function CountDownSessionRace({ nextSession, nextRace }: NextSessionRace) {

    return (
        <div className="container my-4 text-center">
            {nextSession && nextRace && nextSession.sessionDateTime !== nextRace.sessionDateTime && (
                <CountDown name={nextSession.name} sessionDateTime={nextSession.sessionDateTime} />
            )}

            {nextRace && (
                <CountDown name={nextRace.name} sessionDateTime={nextRace.sessionDateTime} />
            )}
        </div>
    )
}