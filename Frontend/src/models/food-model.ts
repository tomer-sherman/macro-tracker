// A food from the database, as returned by POST /api/food-by-desc. All stats are per 100 g:
export type FoodModel = {
    _id: string;
    code: number;
    foodGroup: number;
    nameHe: string;
    nameEn: string | null;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
    sugars: number | null;
    sodiumMg: number | null;
    createdAt: string;
    updatedAt: string;
};
