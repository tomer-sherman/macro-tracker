import { NavLink } from "react-router-dom";
import "./menu.css";

export function Menu() {
    return (
        <nav className="Menu" aria-label="Main">

            <NavLink to="/todays-logs">Today's logs</NavLink>
            <NavLink to="/history">History</NavLink>

        </nav>
    );
}
