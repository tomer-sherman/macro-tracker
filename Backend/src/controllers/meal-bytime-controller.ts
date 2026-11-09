import express, { Request, Response, Router } from "express";
import { mealbytimeService } from "../services/meal-bytime-service";


type RequestQueries = {
    timeZone: string;
    startDate: string;
    endDate?: string;
    order?: string;
};

class MealByTimeController {

    public router: Router = express.Router();

    public constructor() {
        this.router.get("/api/meals-by-date-range", this.getMealsByRange);
    }

    // GET /api/meals-by-date-range?timeZone=Asia/Jerusalem&startDate=2026-11-01&endDate=2026-11-07&order=desc
    private async getMealsByRange(request: Request, response: Response): Promise<void> {

        const { timeZone, startDate, endDate, order } = request.query as RequestQueries;

        const meals = await mealbytimeService.getMealsByDateRange(timeZone, startDate, endDate, order);
        response.json(meals);

    }



}

export const mealbytimeController = new MealByTimeController();
