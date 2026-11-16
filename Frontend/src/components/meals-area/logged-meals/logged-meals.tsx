import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../../redux/store";
import { mealService } from "../../../services/meal-service";
import { dateUtil } from "../../../utils/date-util";
import { notify } from "../../../utils/notify";
import { MealList } from "../meal-list/meal-list";

export function LoggedMeals() {

    // Rendered straight from redux - a newly logged meal shows up here as soon as it's dispatched:
    const meals = useSelector((state: AppState) => state.meals.meals);
    const loadedFor = useSelector((state: AppState) => state.meals.loadedFor);

    // No spinner when today's meals are already in redux (e.g. coming back from another page):
    const [isLoading, setIsLoading] = useState(loadedFor !== dateUtil.todayKey());
    const [loadFailed, setLoadFailed] = useState(false);

    // On page load / refresh - fetch today's meals into redux:
    useEffect(() => {
        mealService.getTodaysMeals()
            .catch((err: any) => {
                setLoadFailed(true);
                notify.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <MealList
            title="Logged meals"
            meals={meals}
            isLoading={isLoading}
            loadFailed={loadFailed}
            emptyText="No meals logged today yet."
            failedText="Couldn't load today's meals."
        />
    );
}
