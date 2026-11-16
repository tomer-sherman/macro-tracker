import { MealModel } from "../../../models/meal-model";
import { Spinner } from "../../shared-area/spinner/spinner";
import { MealCard } from "../meal-card/meal-card";
import "./meal-list.css";

type MealListProps = {
    title: string;
    meals: MealModel[];
    isLoading: boolean;
    loadFailed: boolean;
    emptyText: string;    // Shown when there are no meals.
    failedText: string;   // Shown when loading failed.
    readOnly?: boolean;   // Hides the Remove button on the cards.
    onRetry?: () => void; // Shows a "Try again" button when loading failed.
};

// A card with a titled list of meals, plus its loading / empty / failed states:
export function MealList({ title, meals, isLoading, loadFailed, emptyText, failedText, readOnly, onRetry }: MealListProps) {
    return (
        <section className="MealList card" aria-busy={isLoading}>

            <div className="section-header">
                <h3>{title}</h3>
                {!isLoading && !loadFailed && <span className="count">{meals.length}</span>}
            </div>

            {isLoading && <Spinner />}

            {!isLoading && loadFailed && meals.length === 0 && (
                <div className="empty">
                    <p>{failedText}</p>
                    {onRetry && <button type="button" className="btn-secondary" onClick={onRetry}>Try again</button>}
                </div>
            )}

            {!isLoading && !loadFailed && meals.length === 0 && (
                <div className="empty">
                    <p>{emptyText}</p>
                </div>
            )}

            {!isLoading && meals.length > 0 && (
                <ul>
                    {meals.map(meal => <MealCard key={meal._id} meal={meal} readOnly={readOnly} />)}
                </ul>
            )}

        </section>
    );
}
