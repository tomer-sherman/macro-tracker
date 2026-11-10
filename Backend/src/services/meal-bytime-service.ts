import { DateTime, IANAZone } from "luxon";
import { IMealModel, MealModel } from "../models/meal-log-model";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";

type DATE_RANGE = {
    start: Date;
    end: Date;
}

type SortOrder = 1 | -1 | "asc" | "desc";


class MealByTimeService {

    public async getMealsByDateRange(timezone: string, startDate: string, endDate?: string, order?: string): Promise<IMealModel[]> {

        const sortOrder = this.validateOrder(order);
        const { start, end } = this.convertDateToUTC(timezone, startDate, endDate);

        const meals = await MealModel.
            find({ createdAt: { $gte: start, $lt: end } })
            .sort({ createdAt: sortOrder, calories: 1 }).exec();

        return meals;

    }

    private validateOrder(order: string | number | undefined): SortOrder {
        if (!order) return "asc";
        if (order === 1 || order === -1) return order;
        if (order === "asc" || order === "desc") return order;

        throw new ClientError(StatusCode.BadRequest, `invalid order format, use asc or desc, 1 or -1`)
    }

    private convertDateToUTC(timezone: string, startDate: string, endDate?: string): DATE_RANGE {

        // Validates the dates and timeszone:
        if (!DateTime.fromISO(startDate).isValid) throw new ClientError(StatusCode.UnprocessableContent, "Invalid date format send the following format YY-MM-DD");
        if (endDate) { if (!DateTime.fromISO(endDate).isValid) throw new ClientError(StatusCode.UnprocessableContent, "Invalid date format send the following format YY-MM-DD"); }
        if (!IANAZone.create(timezone).isValid) throw new ClientError(StatusCode.UnprocessableContent, "Invalid timezone, check the check the list of valid time zones.");

        const zone = IANAZone.create(timezone);
        const luxonStart = DateTime.fromISO(startDate, { zone }).startOf("day");

        const end = endDate ?
            DateTime.fromISO(endDate, { zone }).startOf("day").toJSDate() :
            luxonStart.plus({ days: 1 }).toJSDate();

        return {
            start: luxonStart.toJSDate(),
            end
        }
    }

}

export const mealbytimeService = new MealByTimeService();