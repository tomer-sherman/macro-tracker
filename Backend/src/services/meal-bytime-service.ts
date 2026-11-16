import { DateTime, IANAZone } from "luxon";
import { IMealModel, MealModel } from "../models/meal-log-model";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";
import { Types } from "mongoose";

type DATE_RANGE = {
    start: Date;
    end: Date;


}

type SortOrder = 1 | -1 | "asc" | "desc";




class MealByTimeService {

    public async getMealsByDateRange(timezone: string, startDate: string, userId: string, endDate?: string, order?: string): Promise<IMealModel[]> {

        const sortOrder = this.validateOrder(order);
        const { start, end } = this.convertDateToUTC(timezone, startDate, endDate);

        const meals = await MealModel.
            find({ createdAt: { $gte: start, $lt: end }, userId: { $eq: userId } })
            .sort({ createdAt: sortOrder, calories: 1 }).exec();

        return meals;

    }

    public async getStatsByRange(timezone: string, startDate: string, userId: string, endDate?: string): Promise<object> {

        const { start, end } = this.convertDateToUTC(timezone, startDate, endDate);
        const rangeLabel = endDate ? `${startDate} / ${endDate}` : startDate;

        // Days in range, inclusive (14 → 30 = 17 days)
        const totalDays = this.countDaysInRange(startDate, endDate);


        const results = await MealModel.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, userId: { $eq: new Types.ObjectId(userId) } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: timezone
                        }
                    },
                    sumCalories: { $sum: "$calories" },
                    sumProtein: { $sum: "$protien" },
                    sumCarbs: { $sum: "$carbs" },
                    sumFats: { $sum: "$fats" },
                    sumSugars: { $sum: "$sugars" },

                }
            },
            { $sort: { _id: 1 } }, // So logs come out in date order
            {
                $group: {
                    _id: rangeLabel, // Must be named _id
                    totalCalories: { $sum: "$sumCalories" },
                    totalProtein: { $sum: "$sumProtein" },
                    totalCarbs: { $sum: "$sumCarbs" },
                    totalFats: { $sum: "$sumFats" },
                    totalSugars: { $sum: "$sumSugars" },
                    daysLogged: { $sum: 1 }, // Tracks how many days had meals
                    // One object per logged day
                    logs: {
                        $push: {
                            date: "$_id",
                            calories: { $round: ["$sumCalories", 2] },
                            protein: { $round: ["$sumProtein", 2] },
                            carbs: { $round: ["$sumCarbs", 2] },
                            fats: { $round: ["$sumFats", 2] },
                            sugars: { $round: ["$sumSugars", 2] }
                        }
                    }
                }
            },
            {
                // Divide by days in range, not days logged
                $project: {
                    avgCalories: { $divide: ["$totalCalories", totalDays] },
                    avgProtein: { $divide: ["$totalProtein", totalDays] },
                    avgCarbs: { $divide: ["$totalCarbs", totalDays] },
                    avgFats: { $divide: ["$totalFats", totalDays] },
                    avgSugars: { $divide: ["$totalSugars", totalDays] },
                    daysLogged: 1,
                    totalDays: { $literal: totalDays },
                    logs: 1
                }
            }
        ]);

        // If raw does not return anything
        const raw = results[0];
        if (!raw) {
            return {
                _id: rangeLabel,
                avgCalories: 0,
                avgProtein: 0,
                avgCarbs: 0,
                avgFats: 0,
                avgSugars: 0,
                daysLogged: 0,
                totalDays,
                logs: []
            };
        }

        // For each field round too 2 decimals
        const stats = Object.fromEntries
            (Object.entries(raw)
                .map(enrty => [enrty[0],
                typeof enrty[1] !== "number" ?
                    enrty[1] : Math.round(enrty[1] * 100) / 100]));

        return stats;

    }

    private countDaysInRange(startDate: string, endDate?: string): number {
        if (!endDate) return 1;

        const msPerDay = 1000 * 60 * 60 * 24;
        const diff = new Date(endDate).getTime() - new Date(startDate).getTime();

        return Math.round(diff / msPerDay) + 1; // +1 so the end day counts
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