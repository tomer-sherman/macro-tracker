import { MealModel } from "../../../models/meal-model";
import { Skeleton } from "../../shared-area/skeleton/skeleton";
import { StatusPanel } from "../../shared-area/status-panel/status-panel";
import { DailySummary } from "../daily-summary/daily-summary";
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

            {isLoading && <Skeleton label="Loading meals..." />}

            {!isLoading && loadFailed && meals.length === 0 && (
                <StatusPanel kind="failed" text={failedText}>
                    {onRetry && <button type="button" className="btn-secondary" onClick={onRetry}>Try again</button>}
                </StatusPanel>
            )}

            {!isLoading && !loadFailed && meals.length === 0 && <StatusPanel kind="empty" text={emptyText} />}

            {!isLoading && meals.length > 0 && (
                <>
                    <DailySummary meals={meals} />
                    <ul>
                        {meals.map(meal => <MealCard key={meal._id} meal={meal} readOnly={readOnly} />)}
                    </ul>
                </>
            )}

        </section>
    );
}
