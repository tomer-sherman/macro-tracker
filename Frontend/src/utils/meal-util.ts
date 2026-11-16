import { FoodEstimateModel } from "../models/food-estimate-model";
import { FoodModel } from "../models/food-model";
import { MealDraft, MealModel, MealStats } from "../models/meal-model";

class MealUtil {

    public readonly statKeys = ["calories", "protien", "carbs", "fats", "fiber", "sugars"] as const;

    // A blank form row for manual entry (grams defaults to 100, like the backend):
    public emptyDraft(): MealDraft {
        return {
            desc: "",
            grams: 100,
            calories: null,
            protien: null,
            carbs: null,
            fats: null,
            fiber: null,
            sugars: null,
            per100: null
        };
    }

    // A food's stats, renamed to the meal-log field names (protein -> protien, fat -> fats):
    public statsFromFood(food: FoodModel): MealStats {
        return {
            calories: food.calories,
            protien: food.protein,
            carbs: food.carbs,
            fats: food.fat,
            fiber: food.fiber,
            sugars: food.sugars
        };
    }

    // Stats per 100 g -> stats for the given weight (rounded to 2 decimals, like the backend):
    public scale(per100: MealStats, grams: number): MealStats {
        return this.mapStats(per100, value => Math.round(value * grams / 100 * 100) / 100);
    }

    // AI estimate -> form row. desc is the food's English name (Hebrew name if it has no English one).
    // The AI stats are already scaled to food.grams, so per 100 g is worked back from them:
    public fromEstimate(food: FoodEstimateModel): MealDraft {
        const stats = this.statsFromFood(food);
        return {
            desc: food.nameEn || food.nameHe,
            grams: food.grams,
            ...stats,
            per100: food.grams > 0 ? this.mapStats(stats, value => value * 100 / food.grams) : null
        };
    }

    // Validated form row -> body for POST /api/meals:
    public toMeal(draft: MealDraft): MealModel {
        return {
            desc: draft.desc.trim(),
            grams: Number(draft.grams),
            calories: Number(draft.calories),
            protien: Number(draft.protien),
            carbs: Number(draft.carbs),
            fats: Number(draft.fats),
            fiber: draft.fiber,
            sugars: draft.sugars
        };
    }

    // For display - rounds to 1 decimal, "—" when there's no value:
    public format(value: number | null | undefined): string {
        if (value === null || value === undefined) return "—";
        return String(Math.round(value * 10) / 10);
    }

    private mapStats(stats: MealStats, fn: (value: number) => number): MealStats {
        const result = {} as MealStats;
        for (const key of this.statKeys) {
            const value = stats[key];
            result[key] = value === null ? null : fn(value);
        }
        return result;
    }

}

export const mealUtil = new MealUtil();
