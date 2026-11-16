import { MealModel } from "../../../models/meal-model";
import { Gauge } from "../../shared-area/gauge/gauge";
import { MacroBar } from "../../shared-area/macro-bar/macro-bar";
import "./daily-summary.css";

type DailySummaryProps = {
    meals: MealModel[];
};

// Energy per gram (Atwater factors) - for each macro's share of the day's energy:
const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };
const SHARE_LABEL = "of energy";

// The totals of a list of meals: a calories gauge + a bar per macro.
// There's no daily goal yet, so the ring and bars show each macro's share of the energy:
export function DailySummary({ meals }: DailySummaryProps) {

    const totals = meals.reduce(
        (sum, meal) => ({
            calories: sum.calories + meal.calories,
            protein: sum.protein + meal.protien,
            carbs: sum.carbs + meal.carbs,
            fat: sum.fat + meal.fats
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const energy = {
        protein: totals.protein * KCAL_PER_GRAM.protein,
        carbs: totals.carbs * KCAL_PER_GRAM.carbs,
        fat: totals.fat * KCAL_PER_GRAM.fat
    };
    const energyTotal = energy.protein + energy.carbs + energy.fat;
    const share = (kcal: number) => (energyTotal > 0 ? kcal / energyTotal : 0);

    return (
        <section className="DailySummary" aria-label="Totals">

            <Gauge
                value={totals.calories}
                unit="kcal"
                label="Total"
                split={[
                    { tone: "protein", value: energy.protein },
                    { tone: "carbs", value: energy.carbs },
                    { tone: "fat", value: energy.fat }
                ]}
            />

            <div className="summary-bars">
                <p className="summary-caption">Macros · share of energy</p>
                <MacroBar label="Protein" tone="protein" value={totals.protein} unit="g" share={share(energy.protein)} shareLabel={SHARE_LABEL} />
                <MacroBar label="Carbs" tone="carbs" value={totals.carbs} unit="g" share={share(energy.carbs)} shareLabel={SHARE_LABEL} />
                <MacroBar label="Fat" tone="fat" value={totals.fat} unit="g" share={share(energy.fat)} shareLabel={SHARE_LABEL} />
            </div>

        </section>
    );
}
