import { IFoodModel } from "../models/food-model";

export type descMatch = {
    matches: string[];
}

type ExtractedFood = {
    food: string;
    grams: number;
};

export type aiExtraction = {
    items: ExtractedFood[];
};

class UtilHelper {

    public parseCompletion(completion: string) {
        const string = completion.substring(completion.indexOf("{"), completion.lastIndexOf("}") + 1);
        const json: descMatch = JSON.parse(string);
        return json
    }
    // TO DO MAKE THIS PARSING MORE GENERAL!!!!!!!!
    public parseCompletion2(completion: string) {
        const string = completion.substring(completion.indexOf("{"), completion.lastIndexOf("}") + 1);
        const json: aiExtraction = JSON.parse(string);
        return json
    }

    public calculateWithMultiplayer(food: IFoodModel, userGrams: number): object {
        const mult = userGrams / 100;

        // Numeric fields that are identifiers, not nutrition values - never multiply these
        const excludedKeys = ["code", "foodGroup", "_id"];

        // Turn the obj into an arr then map it
        const foodArr = Object.entries(food.toObject()).map(entry => {

            // If the entry is not included in the arr of exludion, and the type is a number
            if (typeof entry[1] === "number" && !excludedKeys.includes(entry[0])) {

                // Return the entry with a the numbered field multiplied
                return [entry[0], Math.round(entry[1] as number * mult * 100) / 100];

                // else return the entry as is
            } else { return entry }
        });

        // NO IF I REMOVE THE IF FROM THE MAP, THEN THIS CRASHES
        const foodObj = Object.fromEntries(foodArr);
        foodObj.grams = userGrams;

        return foodObj;
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
