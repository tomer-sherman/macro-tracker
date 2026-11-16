// A meal log, matching the backend's meal-log model (field names kept exactly as the backend spells them):
export type MealModel = {
    _id?: string;
    desc: string;
    grams: number;
    calories: number;
    protien: number;
    carbs: number;
    fats: number;
    fiber: number | null;
    sugars: number | null;
    createdAt?: string;
    updatedAt?: string;
};

// The nutrition stats of a meal, in the meal-log field names:
export type MealStats = {
    calories: number | null;
    protien: number | null;
    carbs: number | null;
    fats: number | null;
    fiber: number | null;
    sugars: number | null;
};

// One row in the "Log a meal" form, before validation (empty number inputs are null):
export type MealDraft = MealStats & {
    desc: string;
    grams: number | null;
    // The row's stats per 100 g when they came from the database / AI - used to rescale them when the weight changes.
    // null = typed in by hand, nothing to rescale. Never sent to the backend.
    per100: MealStats | null;
};

export type MealsFormValues = {
    meals: MealDraft[];
};
