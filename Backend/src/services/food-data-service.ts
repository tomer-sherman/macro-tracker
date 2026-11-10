import mongoose from "mongoose";
import { FoodModel, IFoodModel } from "../models/food-model";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";
import { promptHolder } from "../utils/prompt-holder";
import { gptService } from "./gpt-service";

type aiEstimateResponse = {
    matchId: string;
    grams: number;
}

class FoodService {

    public async getAiEstimate(userPrompt: string): Promise<object> {

        const data = await this.searchFood(userPrompt);
 
        const completion = await gptService.getCompletion(userPrompt, data.toString(), promptHolder.aiEstimateSystemPrompt);
        console.log("Completion: " + completion)
        const parsedCompletion = JSON.parse(completion) as aiEstimateResponse;
        console.log("Parsed completion: " + parsedCompletion.matchId);

        const id = parsedCompletion.matchId;
        const userGrams = parsedCompletion.grams;

        const food = await this.getOneFood(id);
        console.log(food);


        const calcedFood = this.calculateWithMultiplayer(food, userGrams);
        return calcedFood;
    }



    private calculateWithMultiplayer(food: IFoodModel, userGrams: number): object {
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

    private async getOneFood(id: string): Promise<IFoodModel> {
        if (!mongoose.isValidObjectId(id)) throw new ClientError(StatusCode.BadRequest, `Id ${id} is not a valid id.`);

        const food = await FoodModel.findById(id).exec();
        if (!food) throw new ClientError(StatusCode.NotFound, `Food ${id} not found.`)

        return food;
    }

    public async searchFood(query: string): Promise<IFoodModel[]> {

        const sortBy = this.sortBylang(query);

        const results = await FoodModel
            .find({ $text: { $search: query } })
            .select({ matchScore: { $meta: "textScore" }, ...sortBy })
            .sort({ matchScore: { $meta: "textScore" } })
            .limit(20).exec();

        return results;

    }

    private sortBylang(query: string): object {
        // 1. Count Hebrew and English characters
        const hebrewCount = (query.match(/[\u0590-\u05FF]/g) || []).length;
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

export const foodService = new FoodService();