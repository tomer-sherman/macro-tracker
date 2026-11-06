import express, { Request, Response, Router } from "express";
import { mealbytimeService } from "../services/meal-bytime-service";

class MealByTimeController {


    public router: Router = express.Router();

    public constructor() {
        this.router.get("/api/meals-by-date-range", this.getMealsByRange)
    }

    private async getMealsByRange(request: Request, response: Response): Promise<void> {

        // TODO make everything in the request params!!!
        const timeZone: string = request.body.timeZone;
        const startDate: string = request.body.startDate;
        const endDate: string | undefined = request.body.endDate;
        const order: string | undefined = request.body.order;

        const meals = await mealbytimeService.getMealsByDateRange(timeZone, startDate, endDate, order);
        response.json(meals);

    }



}

export const mealbytimeController = new MealByTimeController();