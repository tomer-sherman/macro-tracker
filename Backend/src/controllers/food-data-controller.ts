import express, { Request, Response, Router } from "express";
import { mealbytimeService } from "../services/meal-bytime-service";
import { foodService } from "../services/food-data-service";


class FoodDataController {

    public router: Router = express.Router();

    public constructor() {
        this.router.get("/api/food-data", this.searchFood);
        this.router.post("/api/ai-autofill", this.getAiEstimate)
        this.router.post("/api/food-by-desc", this.getFoodByDesc)
    }

    // GET /api/food-data?query=apple
    private async searchFood(request: Request, response: Response): Promise<void> {

        const query = request.query.query as string;
        const meals = await foodService.searchFood(query);
        response.json(meals);

    }

    private async getFoodByDesc(request: Request, response: Response): Promise<void> {

        const desc = request.body.desc as string;
        const meal = await foodService.getOneFoodByDesc(desc);

        response.json(meal);

    }

    private async getAiEstimate(request: Request, response: Response): Promise<void> {

        const userPrompt = request.body.prompt as string;
        const aiEstimate = await foodService.getAiEstimate(userPrompt);
        response.json(aiEstimate);

    }



}

export const foodDataController = new FoodDataController();
