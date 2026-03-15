import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light p-3 fixed-top border-5 border-danger" style={{ borderBottom: "double" }}>
            <Link to="/" className="navbar-brand">Home</Link>
            <div className="navbar-nav">
                <Link to="/DriversStandings" className="nav-link px-2">WDC</Link>
            </div>
            <div className="navbar-nav">
                <Link to="/Results" className="nav-link px-2">Results</Link>
            </div>
            <div className="navbar-nav">
                <Link to="/NextRace" className="nav-link px-2">Next Race</Link>
            </div>
        </nav>
    );
}