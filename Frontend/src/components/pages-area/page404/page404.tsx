import { Link } from "react-router-dom";
import "./page404.css";

export function Page404() {
    return (
        <div className="Page404">

            <p className="code" aria-hidden="true">404</p>
            <h2>Page not found</h2>
            <Link to="/" className="btn-secondary">Back to the app</Link>

        </div>
    );
}
