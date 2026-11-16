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
        this.router.get("/api/meals-stats-by-range", this.getStatsByRange);
    }

    // GET /api/meals-by-date-range?timeZone=Asia/Jerusalem&startDate=2026-11-01&endDate=2026-11-07&order=desc
    private async getMealsByRange(request: Request, response: Response): Promise<void> {

        const { timeZone, startDate, endDate, order } = request.query as RequestQueries;
        const userId = request.userId!;

        const meals = await mealbytimeService.getMealsByDateRange(timeZone, startDate, userId, endDate, order);
        response.json(meals);

    }

    private async getStatsByRange(request: Request, response: Response): Promise<void> {

        const { timeZone, startDate, endDate } = request.query as RequestQueries;
        const userId = request.userId!;
        const stats = await mealbytimeService.getStatsByRange(timeZone, startDate, userId ,endDate);

        response.json(stats);

    }
}

export const mealbytimeController = new MealByTimeController();
