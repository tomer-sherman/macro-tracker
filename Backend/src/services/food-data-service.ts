
import { FoodModel, IFoodModel } from "../models/food-model";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";
import { promptHolder } from "../utils/prompt-holder";
import { utilHelper } from "../utils/util-helper";
import { gptService } from "./gpt-service";


class FoodService {

    public async getAiEstimate(userPrompt: string): Promise<object> {
        // 1. Extract foods + grams from the user's text
        const extractorCompletion = await gptService.getCompletion(userPrompt, promptHolder.aiExtractor);
        const extracted = utilHelper.parseCompletion2(extractorCompletion);

        // 2. Search candidates for each food, in parallel
        const candidateLists = await Promise.all(
            extracted.items.map((item) => this.searchFood(item.food))
        );

        // 3. AI picks one description per list
        const pickerInput = {
            foods: extracted.items.map((item) => item.food),
            meals: candidateLists,
            total: candidateLists.length,
        };


        const pickerCompletion = await gptService.getCompletion(JSON.stringify(pickerInput), promptHolder.aiPicker);
        const picked = utilHelper.parseCompletion(pickerCompletion);

        // 4. Fetch the picked docs and calculate stats by grams
        const pickedDocs = await Promise.all(
            picked.matches.map((desc) => this.getOneFoodByDesc(desc))
        );

        return extracted.items.map((item, i) =>
            utilHelper.calculateWithMultiplayer(pickedDocs[i], item.grams)
        );


    }

    private async getOneFoodByDesc(desc: string): Promise<IFoodModel> {

        const food = await FoodModel.findOne({ nameEn: desc }).exec();
        if (!food) throw new ClientError(StatusCode.NotFound, `Food with ${desc} not found.`);

        return food;
    }

    public async searchFood(query: string): Promise<IFoodModel[]> {

        const sortBy = utilHelper.sortBylang(query);

        const results = await FoodModel
            .find({ $text: { $search: query } })
            .select({ matchScore: { $meta: "textScore" }, ...sortBy, _id: 0 })
            .sort({ matchScore: { $meta: "textScore" } })
            .limit(20).exec();

        return results;

    }

}

export const foodService = new FoodService();
