
interface Session {
    name: string;
    sessionDateTime: string;
}

interface Props {
    sessions: Session[];
    raceDateTime: string;
}

const SESSION_LABELS: Record<string, string> = {
    FirstPractice: "FP1",
    SecondPractice: "FP2",
    ThirdPractice: "FP3",
    Qualifying: "Qualifying",
    Sprint: "Sprint",
    SprintQualifying: "Sprint Qualifying",
    SprintShootout: "Sprint Shootout",
    Race: "Race",
};

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const shortenedTimeZone = new Date().toLocaleString('en', { timeZoneName: 'short' })?.split(" ").at(-1);

function formatUserTime(dateStr: string): { day: string; time: string } {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString("en-GB", { timeZone: userTimeZone, weekday: "short" });
    const time = date.toLocaleTimeString("en-GB", { timeZone: userTimeZone, hour: "2-digit", minute: "2-digit" });
    return { day, time };
}

export default function SessionSchedule({ sessions, raceDateTime }: Props) {
    const now = new Date();

    const allSessions = [
        ...sessions.map(s => ({ name: s.name, sessionDateTime: s.sessionDateTime })),
        { name: "Race", sessionDateTime: raceDateTime },
    ];

    const nextSession = allSessions.find(s => new Date(s.sessionDateTime) > now);

    return (
        <div className="flex flex-col justify-between h-full min-w-sm max-w-lg">
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
                Schedule · {shortenedTimeZone}
            </p>
            <div className="flex flex-col gap-1 flex-1">
                {allSessions.map((session) => {
                    const label = SESSION_LABELS[session.name] ?? session.name;
                    const { day, time } = formatUserTime(session.sessionDateTime);
                    const isNext = nextSession?.name === session.name &&
                        nextSession?.sessionDateTime === session.sessionDateTime;
                    const isPast = new Date(session.sessionDateTime) < now;

                    return (
                        <div
                            key={`${session.name}-${session.sessionDateTime}`}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${isNext
                                ? "bg-red-600/10 border border-red-600/60 text-zinc-900 dark:text-white"
                                : isPast
                                    ? "text-zinc-400 dark:text-zinc-600"
                                    : "text-zinc-600 dark:text-zinc-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {isNext && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                                )}
                                {!isNext && <span className="w-1.5 h-1.5 shrink-0" />}
                                <span className={`font-medium ${isPast ? "" : "text-zinc-900 dark:text-white"}`}>
                                    {label}
                                </span>
                            </div>
                            <span className="font-mono text-xs">
                                {day} {time}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
