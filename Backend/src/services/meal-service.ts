
import { ClientError } from "../utils/error-handeling/client-error";
import { IMealModel, MealModel } from "../models/meal-model";
import { StatusCode } from "../utils/error-handeling/enums";
import mongoose, { Types } from "mongoose";


// Logic:
class MealService {

    // Get all products:
    public async getAllMeals(): Promise<IMealModel[]> {

        const meals = await MealModel.find().exec()
        return meals
    }


    // Get one
    public async getOneMeal(id: string): Promise<IMealModel> {

        if (!mongoose.isValidObjectId(id)) throw new ClientError(StatusCode.UnprocessableContent, `ID: ${id}, is invalid.`);

        const meal = await MealModel.findById(id).exec();
        if (!meal) throw new ClientError(StatusCode.NotFound, `ID: ${id}, not found.`);
        return meal;

    }

    // Add one meal
    public async addMeal(meal: IMealModel): Promise<IMealModel> {

        await MealModel.validate(meal);

        const dbMeal = await meal.save();

        return dbMeal;

    }

    public async removeMeal(id: string): Promise<void> {
        // Prevents cast
        if (!mongoose.isValidObjectId(id)) throw new ClientError(StatusCode.UnprocessableContent, `Unproccesable id to delete ${id}`);

        // Prevents 404
        await this.getOneMeal(id);
        await MealModel.findByIdAndDelete(id);

    }

    public async updateMeal(meal: IMealModel): Promise<IMealModel> {

        const id = meal._id;
        // Handles bad id in the params
        if(!mongoose.isValidObjectId(id)) throw new ClientError(StatusCode.BadRequest, `Bad request id: ${id} not valid.` );
       
        // Handles validation errors
        await MealModel.validate(meal);

        // Handeles not found
        await this.getOneMeal(id.toString());
        console.log("Not found passed!");

        const dbMeal = await MealModel.findByIdAndUpdate(id, meal, { returnDocument: "after" }).exec();

        // Since get one already handles not found, then i simply shut up ts here
        return dbMeal!;

    }

}

export const mealService = new MealService();
