import { LoggedMeals } from "../../meals-area/logged-meals/logged-meals";
import { LogMeal } from "../../meals-area/log-meal/log-meal";
import "./todays-logs.css";

export function TodaysLogs() {

    const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

    return (
        <div className="TodaysLogs">

            <div className="page-title">
                <h2>Today's logs</h2>
                <span className="date">{today}</span>
            </div>

            <div className="sections">
                <LogMeal />
                <LoggedMeals />
            </div>

        </div>
    );
}
