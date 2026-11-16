import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AppState } from "../../../redux/store";
import { userService } from "../../../services/user-service";
import { Menu } from "../menu/menu";
import "./header.css";

export function Header() {

    const user = useSelector((state: AppState) => state.user.user);
    const navigate = useNavigate();

    function logout(): void {
        userService.logout();
        navigate("/login");
    }

    return (
        <div className="Header">

            <div className="nav-side">
                <Link to="/" className="brand">MacroTracker</Link>
                {/* The menu's pages need a logged-in user: */}
                {user && <Menu />}
            </div>

            {user && (
                <div className="user-box">
                    <button type="button" className="btn-secondary" onClick={logout}>Log out</button>
                </div>
            )}

        </div>
    );
}
