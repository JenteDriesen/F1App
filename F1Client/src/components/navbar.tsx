import { Link } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";

export default function Navbar() {
    const { dark, toggle } = useDarkMode();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-3 bg-white dark:bg-zinc-900 border-b-8 border-double border-red-600">
            <Link to="/" className="font-bold text-zinc-900 dark:text-white">Home</Link>
            <Link to="/DriversStandings" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">WDC</Link>
            <Link to="/Results" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Results</Link>
            <Link to="/NextRace" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Next Race</Link>
            <button onClick={toggle} className="ml-auto text-sm px-3 py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
        </nav>
    );
}