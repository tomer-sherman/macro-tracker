
import { Document, model, Schema, Types } from "mongoose";



export interface IMealModel extends Document {

    _id: Types.ObjectId;
    calories: number,
    carbs: number,
    fats: number;
    protien: number;
    desc: string,
    
}


const trimSpaces = (value: string) => value.trim().replace(/[ \t]+/g, " ");

export const MealSchema = new Schema<IMealModel>({

    calories: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [1, "Minimum cal cannot be below 1"],
        max: [8000, "You fat bro??"]
    },
    carbs: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [1, "Minimum cal cannot be below 1"],
        max: [8000, "You fat bro??"]
    },
    fats: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [1, "Minimum cal cannot be below 1"],
        max: [8000, "You fat bro??"]
    },
    protien: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [1, "Minimum cal cannot be below 1"],
        max: [8000, "You fat bro??"]
    },
    desc: {
        type: String,
        required: [true, "Description is a required field."],
        set: trimSpaces,
        minLength: [5, "Description cannot be less than 5 chars."],
        maxLength: [300, "Description cannot be more than 300 chars."],
        lowercase: true
    }
   
}, {
    versionKey: false,
    id: false,
    timestamps: true
})

export const MealModel = model<IMealModel>("MealModel", MealSchema, "meal_logs");



