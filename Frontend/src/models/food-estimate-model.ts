import { FoodModel } from "./food-model";

// One food returned by POST /api/ai-autofill - a food with its stats already scaled to `grams`:
export type FoodEstimateModel = FoodModel & {
    grams: number;
};
