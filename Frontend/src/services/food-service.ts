import axios from "axios";
import { FoodEstimateModel } from "../models/food-estimate-model";
import { FoodModel } from "../models/food-model";
import { FoodSearchResultModel } from "../models/food-search-result-model";
import { appConfig } from "../utils/app-config";

class FoodService {

    // POST /api/ai-autofill with { prompt } -> one estimated food per item found in the description:
    public async getAiEstimate(prompt: string): Promise<FoodEstimateModel[]> {
        const response = await axios.post<FoodEstimateModel[]>(appConfig.aiAutofillUrl, { prompt });
        return response.data;
    }

    // GET /api/food-data?query=... -> up to 20 matching food names (the signal cancels a stale search):
    public async searchFood(query: string, signal?: AbortSignal): Promise<FoodSearchResultModel[]> {
        const response = await axios.get<FoodSearchResultModel[]>(appConfig.foodDataUrl, { params: { query }, signal });
        return response.data;
    }

    // POST /api/food-by-desc with { desc } (an English name) -> the full food, stats per 100 g:
    public async getFoodByDesc(desc: string): Promise<FoodModel> {
        const response = await axios.post<FoodModel>(appConfig.foodByDescUrl, { desc });
        return response.data;
    }

}

export const foodService = new FoodService();
