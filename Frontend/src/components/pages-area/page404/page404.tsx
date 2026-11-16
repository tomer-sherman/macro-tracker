import { Link } from "react-router-dom";
import "./page404.css";

export function Page404() {
    return (
        <div className="Page404">

            <h2>Page not found</h2>
            <Link to="/">Back to the app</Link>

        </div>
    );
}
