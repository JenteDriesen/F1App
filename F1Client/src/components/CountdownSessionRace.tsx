import CountDown from "./countDown";

interface Session {
    name: string;
    sessionDateTime: string;
}
interface nextSessionRace {
    nextSession: Session;
    nextRace: Session;
}

export default function CountDownSessionRace({ nextSession, nextRace }: nextSessionRace) {

    return (
        <div className="container my-4 text-center">
            {nextRace && <h2 >{nextRace.name}</h2>}
            {nextSession && nextRace && nextSession.sessionDateTime !== nextRace.sessionDateTime && (
                <CountDown name={nextSession.name} sessionDateTime={nextSession.sessionDateTime} />
            )}

            {nextRace && (
                <CountDown name={nextRace.name} sessionDateTime={nextRace.sessionDateTime} />
            )}
        </div>
    )
}