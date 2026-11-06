import express, { Request, Response, Router } from "express";
import { mealService } from "../services/meal-service";
import { MealModel } from "../models/meal-model";
import { StatusCode } from "../utils/error-handeling/enums";

// Contains routes, without logic.
class MealController {

    // Create a router object which can listen on routes:
    public router: Router = express.Router();

    // Constructor - register routes:
    public constructor() {
        this.router.get("/api/meals", this.getAllMeals);
        this.router.post("/api/meals", this.addMeal);
        this.router.get("/api/meals/:id", this.getOneMeal);
        this.router.delete("/api/meals/:id", this.deleteMeal);
        this.router.put("/api/meals/:id", this.updateMeal);
    }

    // Get : 
    private async getAllMeals(request: Request, response: Response): Promise<void> {
        const meals = await mealService.getAllMeals();
        response.json(meals);
    }

    private async getOneMeal(request: Request, response: Response): Promise<void> {

        const id = request.params.id as string;

        const meal = await mealService.getOneMeal(id);
        response.json(meal);
    }

    private async addMeal(request: Request, respose: Response): Promise<void> {

        const meal = new MealModel(request.body);

        const dbMeal = await mealService.addMeal(meal);
        respose.status(StatusCode.Created).json(dbMeal)
    }

    private async updateMeal(request: Request, respose: Response): Promise<void> {

        request.body._id = request.params.id.toString();
        const meal = new MealModel(request.body);

        const dbMeal = await mealService.updateMeal(meal);
        respose.json(dbMeal)

    }

    private async deleteMeal(request: Request, respose: Response): Promise<void> {
        const id = request.params.id as string;
        await mealService.removeMeal(id)
        respose.status(StatusCode.NoContent).json();
    }




}

export const mealController = new MealController();
