import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppState } from "../../../redux/store";
import { History } from "../../pages-area/history/history";
import { Page404 } from "../../pages-area/page404/page404";
import { Stats } from "../../pages-area/stats/stats";
import { TodaysLogs } from "../../pages-area/todays-logs/todays-logs";
import { Login } from "../../user-area/login/login";

export function Routing() {

    const user = useSelector((state: AppState) => state.user.user);

    return (
        <Routes>

            {/* Default Route: */}
            <Route path="/" element={<Navigate to={user ? "/todays-logs" : "/login"} replace />} />

            {/* Login - a logged-in user goes straight to today's logs: */}
            <Route path="/login" element={user ? <Navigate to="/todays-logs" replace /> : <Login />} />

            {/* Today's logs - only for a logged-in user: */}
            <Route path="/todays-logs" element={user ? <TodaysLogs /> : <Navigate to="/login" replace />} />

            {/* History (past days' logs) - only for a logged-in user: */}
            <Route path="/history" element={user ? <History /> : <Navigate to="/login" replace />} />

            {/* Stats (averages + charts over a chosen range) - only for a logged-in user: */}
            <Route path="/stats" element={user ? <Stats /> : <Navigate to="/login" replace />} />

            {/* Page not found: */}
            <Route path="*" element={<Page404 />} />

        </Routes>
    );
}
