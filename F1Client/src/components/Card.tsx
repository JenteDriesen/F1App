import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
    className?: string; // for grid spans only — never for restyling
}

export default function Card({ children, className = "" }: Props) {
    return (
        <div className={`rounded-xl bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 ${className}`}>
            {children}
        </div>
    );
}