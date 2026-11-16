import { StatsBucket } from "../../../utils/stats-util";
import { MacroTone } from "../../shared-area/macro-chip/macro-chip";
import { Readout } from "../../shared-area/readout/readout";
import "./stats-summary.css";

type StatsSummaryProps = {
    summary: StatsBucket; // The whole range as one bucket.
};

const tiles: { key: "calories" | "protein" | "carbs" | "fats" | "sugars"; label: string; unit: string; tone: MacroTone }[] = [
    { key: "calories", label: "Calories", unit: "kcal", tone: "calories" },
    { key: "protein", label: "Protein", unit: "g", tone: "protein" },
    { key: "carbs", label: "Carbs", unit: "g", tone: "carbs" },
    { key: "fats", label: "Fat", unit: "g", tone: "fat" },
    { key: "sugars", label: "Sugars", unit: "g", tone: "neutral" }
];

// A row of tiles - the range's average per day for each stat, plus how many days were logged:
export function StatsSummary({ summary }: StatsSummaryProps) {
    return (
        <dl className="StatsSummary">

            {tiles.map(tile => (
                <div key={tile.key} className={`stat-tile tone-${tile.tone}`}>
                    <dt>{tile.label}</dt>
                    <dd><Readout value={summary[tile.key]} unit={tile.unit} size="lg" countUp /></dd>
                </div>
            ))}

            <div className="stat-tile tone-neutral">
                <dt>Days logged</dt>
                <dd><Readout value={summary.daysLogged} unit={`/ ${summary.days}`} size="lg" /></dd>
            </div>

        </dl>
    );
}
