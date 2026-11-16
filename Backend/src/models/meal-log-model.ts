
import { Document, model, Schema, Types } from "mongoose";



export interface IMealModel extends Document {

    _id: Types.ObjectId;
    calories: number,
    carbs: number,
    fats: number;
    protien: number;
    fiber: number | null;
    sugars: number | null;
    grams: number;
    desc: string,
    userId: Types.ObjectId;

}


const trimSpaces = (value: string) => value.trim().replace(/[ \t]+/g, " ");

export const MealSchema = new Schema<IMealModel>({

    calories: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [0, "Calories cannot be below 0."],
        max: [8000, "You fat bro??"]
    },
    carbs: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [0, "Carbs cannot be below 0."],
        max: [8000, "You fat bro??"]
    },
    fats: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [0, "Fats cannot be below 0."],
        max: [8000, "You fat bro??"]
    },
    protien: {
        type: Number,
        required: [true, "Destination is a required field."],
        min: [0, "Protein cannot be below 0."],
        max: [8000, "You fat bro??"]
    },
    fiber: {
        type: Number,
        default: null,
        min: [0, "Fiber cannot be below 0."],
        max: [100, "Fiber per 100 g cannot be above 100 g."]
    },
    sugars: {
        type: Number,
        default: null,
        min: [0, "Sugars cannot be below 0."],
        max: [100, "Sugars per 100 g cannot be above 100 g."]
    },
    grams: {
        type: Number,
        default: 100,
        min: [0.1, "Grams cannot be below 0.1."]
    },
    desc: {
        type: String,
        required: [true, "Description is a required field."],
        set: trimSpaces,
        minLength: [5, "Description cannot be less than 5 chars."],
        maxLength: [300, "Description cannot be more than 300 chars."],
        lowercase: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, "User id is required to add a meal log."],
        ref: "UserModel",
    }

}, {
    versionKey: false,
    id: false,
    timestamps: true
})

export const MealModel = model<IMealModel>("MealModel", MealSchema, "meal_logs");



