import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light p-3 fixed-top">
            <Link to="/" className="navbar-brand">F1 App</Link>
            <div className="navbar-nav">
                <Link to="/DriversStandings" className="nav-link">WDC</Link>
            </div>
        </nav>
    );
}