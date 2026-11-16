import { mealUtil } from "../../../utils/meal-util";
import { StatsBucket, StatsRange, statsUtil } from "../../../utils/stats-util";
import "./stats-table.css";

type StatsTableProps = {
    range: StatsRange;
    buckets: StatsBucket[];
};

const columns: { key: "calories" | "protein" | "carbs" | "fats" | "sugars"; label: string; unit: string }[] = [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbs", label: "Carbs", unit: "g" },
    { key: "fats", label: "Fat", unit: "g" },
    { key: "sugars", label: "Sugars", unit: "g" }
];

// Every chart point as a table row - the same numbers without hovering (and for screen readers):
export function StatsTable({ range, buckets }: StatsTableProps) {
    return (
        <details className="StatsTable">

            <summary>Table view</summary>

            <div className="table-scroll">
                <table>
                    <caption className="visually-hidden">Average per day, for each period</caption>
                    <thead>
                        <tr>
                            <th scope="col">Period</th>
                            {columns.map(column => (
                                <th scope="col" key={column.key}>{column.label} <span className="unit">{column.unit}</span></th>
                            ))}
                            <th scope="col">Days logged</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buckets.map(bucket => (
                            <tr key={bucket.start}>
                                <th scope="row">{statsUtil.periodName(bucket, range)}</th>
                                {columns.map(column => (
                                    <td key={column.key} className="num">{mealUtil.format(bucket[column.key])}</td>
                                ))}
                                <td className="num">{bucket.daysLogged} / {bucket.days}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </details>
    );
}
