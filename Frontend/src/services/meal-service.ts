import axios from "axios";
import { MealModel } from "../models/meal-model";
import { mealsActions } from "../redux/meals-slice";
import { store } from "../redux/store";
import { appConfig } from "../utils/app-config";
import { dateUtil } from "../utils/date-util";

class MealService {

    // GET /api/meals-by-date-range, oldest first, in the browser's time zone (the signal cancels a stale request).
    // startDate is included, endDate is not. Without endDate the backend returns just startDate's day.
    public async getMealsByDateRange(startDate: string, endDate?: string, signal?: AbortSignal): Promise<MealModel[]> {
        const response = await axios.get<MealModel[]>(appConfig.mealsByDateRangeUrl, {
            params: {
                timeZone: dateUtil.timeZone(),
                startDate,
                endDate, // axios leaves out undefined params.
                order: "asc"
            },
            signal
        });
        return response.data;
    }

    // All meals of a month (YYYY-MM), from its 1st up to (not including) the 1st of the next month:
    public async getMealsByMonth(month: string): Promise<MealModel[]> {
        return this.getMealsByDateRange(`${month}-01`, `${dateUtil.addMonths(month, 1)}-01`);
    }

    // Today's meals, oldest first.
    // Served from redux if already fetched today - after a page refresh redux is empty, so it refetches.
    public async getTodaysMeals(): Promise<MealModel[]> {
        const today = dateUtil.todayKey();

        const { meals, loadedFor } = store.getState().meals;
        if (loadedFor === today) return meals;

        const todaysMeals = await this.getMealsByDateRange(today);

        store.dispatch(mealsActions.initMeals({ meals: todaysMeals, date: today }));
        return todaysMeals;
    }

    // POST /api/meals -> the saved meal (with _id and createdAt), placed in redux:
    public async addMeal(meal: MealModel): Promise<MealModel> {
        const response = await axios.post<MealModel>(appConfig.mealsUrl, meal);
        const dbMeal = response.data;

        store.dispatch(mealsActions.addMeal(dbMeal));
        return dbMeal;
    }

    // DELETE /api/meals/:id -> 204, then removed from redux:
    public async deleteMeal(id: string): Promise<void> {
        await axios.delete(`${appConfig.mealsUrl}/${id}`);
        store.dispatch(mealsActions.removeMeal(id));
    }

}

export const mealService = new MealService();
