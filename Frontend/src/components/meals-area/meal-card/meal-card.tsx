import { useState } from "react";
import { MealModel } from "../../../models/meal-model";
import { mealService } from "../../../services/meal-service";
import { dateUtil } from "../../../utils/date-util";
import { mealUtil } from "../../../utils/meal-util";
import { notify } from "../../../utils/notify";
import { ConfirmModal } from "../../shared-area/confirm-modal/confirm-modal";
import "./meal-card.css";

type MealCardProps = {
    meal: MealModel;
    readOnly?: boolean; // No Remove button (used by the history page).
};

export function MealCard({ meal, readOnly = false }: MealCardProps) {

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const stats = [
        { label: "Calories", value: meal.calories, unit: "kcal" },
        { label: "Protein", value: meal.protien, unit: "g" },
        { label: "Carbs", value: meal.carbs, unit: "g" },
        { label: "Fat", value: meal.fats, unit: "g" },
        { label: "Fiber", value: meal.fiber, unit: "g" },
        { label: "Sugars", value: meal.sugars, unit: "g" }
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
                    <span className="desc">{meal.desc}</span>
                    <span className="grams">{mealUtil.format(meal.grams)} g</span>
                </div>
                <div className="meal-actions">
                    {meal.createdAt && (
                        <time dateTime={meal.createdAt}>{dateUtil.toTime(meal.createdAt)}</time>
                    )}
                    {!readOnly && (
                        <button
                            type="button"
                            className="btn-delete"
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
                    <strong className="modal-meal-name">{meal.desc}</strong>
                    {" "}({mealUtil.format(meal.grams)} g{meal.createdAt && `, logged at ${dateUtil.toTime(meal.createdAt)}`})
                </p>
                <p>It will be removed from your logs. This can't be undone.</p>
            </ConfirmModal>}

            <dl className="stats">
                {stats.map(stat => (
                    <div key={stat.label}>
                        <dt>{stat.label}</dt>
                        <dd>
                            {mealUtil.format(stat.value)}
                            {stat.value !== null && stat.value !== undefined && <span className="unit"> {stat.unit}</span>}
                        </dd>
                    </div>
                ))}
            </dl>

        </li>
    );
}
