import { IFoodModel } from "../models/food-model";

export type aiEstimateResponse = {
    matchId: string;
    grams: number;
}

class UtilHelper {

    public parseCompletion(completion: string) {
        const string = completion.substring(completion.indexOf("{"), completion.lastIndexOf("}") + 1);
        const json: aiEstimateResponse = JSON.parse(string);
        return json
    }

    public calculateWithMultiplayer(food: IFoodModel, userGrams: number): object {
        const mult = userGrams / 100;
        // Numeric fields that are identifiers, not nutrition values - never multiply these
        const excludedKeys = ["code", "foodGroup", "_id"];

        // Turn the mongoose document into a plain obj, then into [key, value] pairs
        const foodObj = Object.entries(food.toObject());

        // Build a new object: nutrition numbers get scaled, everything else is copied as-is
        const multiedFood = Object.fromEntries(foodObj.map(([key, value]) => [
            key,
            typeof value === "number" && !excludedKeys.includes(key)
                ? Math.round(value * mult * 100) / 100 // round to 2 decimals to avoid float noise
                : value
        ]));

        // Set new grams property
        multiedFood.grams = userGrams;

        return multiedFood;
    }

    public sortBylang(query: string): object {
        // 1. Count Hebrew and English characters
        const hebrewCount = (query.match(/[֐-׿]/g) || []).length;
        const englishCount = (query.match(/[a-zA-Z]/g) || []).length;

        let sortBy;

        // If hebrew majority
        if (hebrewCount > englishCount) { sortBy = { nameHe: 1 } }
        // If english majority
        else if (englishCount > hebrewCount) { sortBy = { nameEn: 1 } }
        // If mixxed 50 50 will likley never happen.
        else { sortBy = { nameHe: 1, nameEn: 1 } }

        return sortBy;
    }

}

export const utilHelper = new UtilHelper();
