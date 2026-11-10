import mongoose from "mongoose";
import { FoodModel, IFoodModel } from "../models/food-model";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";
import { promptHolder } from "../utils/prompt-holder";
import { utilHelper } from "../utils/util-helper";
import { gptService } from "./gpt-service";

class FoodService {

    public async getAiEstimate(userPrompt: string): Promise<object> {
        // Run the query, maybe adding another Ai call before is an idea not sure.
        const data = await this.searchFood(userPrompt);

        // get a completion,
        const completion = await gptService.getCompletion(userPrompt, data.toString(), promptHolder.aiEstimateSystemPrompt);
        // Parse completion
        const compJson = utilHelper.parseCompletion(completion);

        // get the exact food, that was matched.
        const food = await this.getOneFood(compJson.matchId);

        // Calculate the amount of macros.
        const calcedFood = utilHelper.calculateWithMultiplayer(food, compJson.grams);
        return calcedFood;
    }

    private async getOneFood(id: string): Promise<IFoodModel> {
        if (!mongoose.isValidObjectId(id)) throw new ClientError(StatusCode.BadRequest, `Id ${id} is not a valid id.`);

        const food = await FoodModel.findById(id).exec();
        if (!food) throw new ClientError(StatusCode.NotFound, `Food ${id} not found.`)

        return food;
    }

    public async searchFood(query: string): Promise<IFoodModel[]> {

        const sortBy = utilHelper.sortBylang(query);

        const results = await FoodModel
            .find({ $text: { $search: query } })
            .select({ matchScore: { $meta: "textScore" }, ...sortBy })
            .sort({ matchScore: { $meta: "textScore" } })
            .limit(20).exec();

        return results;

    }

}

export const foodService = new FoodService();
