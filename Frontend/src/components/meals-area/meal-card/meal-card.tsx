import { useState } from "react";
import { MealModel } from "../../../models/meal-model";
import { mealService } from "../../../services/meal-service";
import { dateUtil } from "../../../utils/date-util";
import { mealUtil } from "../../../utils/meal-util";
import { notify } from "../../../utils/notify";
import { ConfirmModal } from "../../shared-area/confirm-modal/confirm-modal";
import { MacroChip, MacroTone } from "../../shared-area/macro-chip/macro-chip";
import "./meal-card.css";

type MealCardProps = {
    meal: MealModel;
    readOnly?: boolean; // No Remove button (used by the history page).
};

export function MealCard({ meal, readOnly = false }: MealCardProps) {

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const stats: { label: string; value: number | null; unit: string; tone: MacroTone }[] = [
        { label: "Calories", value: meal.calories, unit: "kcal", tone: "calories" },
        { label: "Protein", value: meal.protien, unit: "g", tone: "protein" },
        { label: "Carbs", value: meal.carbs, unit: "g", tone: "carbs" },
        { label: "Fat", value: meal.fats, unit: "g", tone: "fat" },
        { label: "Fiber", value: meal.fiber, unit: "g", tone: "neutral" },
        { label: "Sugars", value: meal.sugars, unit: "g", tone: "neutral" }
    ];

    async function deleteMeal(): Promise<void> {
        if (!meal._id) return;

        setIsDeleting(true);
        try {
            await mealService.deleteMeal(meal._id);
            notify.success("Meal removed.");
            // No need to reset state - the card (and its modal) leaves the list once redux removes the meal.
        }
        catch (err: any) {
            notify.error(err);
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    }

    return (
        <li className="MealCard">

            <div className="meal-top">
                <div>
                    <span className="desc" dir="auto">{meal.desc}</span>
                    <span className="grams">{mealUtil.format(meal.grams)} g</span>
                </div>
                <div className="meal-actions">
                    {meal.createdAt && (
                        <time dateTime={meal.createdAt}>{dateUtil.toTime(meal.createdAt)}</time>
                    )}
                    {!readOnly && (
                        <button
                            type="button"
                            className="btn-ghost btn-delete"
                            aria-label={`Remove ${meal.desc}`}
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={isDeleting}
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>

            {!readOnly && <ConfirmModal
                open={isConfirmOpen}
                title="Remove meal?"
                confirmText="Remove"
                busyText="Removing..."
                danger
                isBusy={isDeleting}
                onConfirm={deleteMeal}
                onCancel={() => setIsConfirmOpen(false)}
            >
                <p>
                    <strong className="modal-meal-name" dir="auto">{meal.desc}</strong>
                    {" "}({mealUtil.format(meal.grams)} g{meal.createdAt && `, logged at ${dateUtil.toTime(meal.createdAt)}`})
                </p>
                <p>It will be removed from your logs. This can't be undone.</p>
            </ConfirmModal>}

            <dl className="stats">
                {stats.map(stat => (
                    <MacroChip key={stat.label} label={stat.label} value={stat.value} unit={stat.unit} tone={stat.tone} />
                ))}
            </dl>

        </li>
    );
}
