import { Document, model, Schema, Types } from "mongoose";

export type IFoodModel = Document & {
    _id: Types.ObjectId;
    code: number;                  // ← smlmitzrach
    foodGroup: number;             // ← first digit of smlmitzrach (1–9)
    nameHe: string;                // ← shmmitzrach
    nameEn: string | null;         // ← english_name
    calories: number | null;           // ← food_energy (kcal / 100 g)
    protein: number | null;                // ← protein (g / 100 g)
    carbs: number | null;                // ← carbohydrates (g / 100 g)
    fat: number | null;                   // ← total_fat (g / 100 g)
    fiber: number | null;          // ← total_dietary_fiber (g / 100 g)
    sugars: number | null;         // ← total_sugars (g / 100 g)
    sodiumMg: number | null;       // ← sodium (mg / 100 g)
};

const trimSpaces = (value: string) => value.trim().replace(/[ \t]+/g, " ");

export const FoodSchema = new Schema<IFoodModel>({

    code: {
        type: Number,
        required: [true, "Code is a required field."],
        unique: true
    },
    foodGroup: {
        type: Number,
        required: [true, "Food group is a required field."],
        min: [1, "Food group must be between 1 and 9."],
        max: [9, "Food group must be between 1 and 9."]
    },
    nameHe: {
        type: String,
        required: [true, "Hebrew name is a required field."],
        set: trimSpaces
    },
    nameEn: {
        type: String,
        default: null,
        trim: true
    },
    calories: {
        type: Number,
        default: null,
        min: [0, "Calories cannot be below 0."],
        max: [1500, "Calories per 100 g cannot be above 1500."]
    },
    protein: {
        type: Number,
        default: null,
        min: [0, "Protein cannot be below 0."],
        max: [100, "Protein per 100 g cannot be above 100 g."]
    },
    carbs: {
        type: Number,
        default: null,
        min: [0, "Carbs cannot be below 0."],
        max: [100, "Carbs per 100 g cannot be above 100 g."]
    },
    fat: {
        type: Number,
        default: null,
        min: [0, "Fat cannot be below 0."],
        max: [100, "Fat per 100 g cannot be above 100 g."]
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
    sodiumMg: {
        type: Number,
        default: null,
        min: [0, "Sodium cannot be below 0."]
    },

}, {
    versionKey: false,
    id: false,
    timestamps: true
});

FoodSchema.index({ nameHe: "text", nameEn: "text" }, { default_language: "none" });
FoodSchema.index({ foodGroup: 1 });

export const FoodModel = model<IFoodModel>("FoodModel", FoodSchema, "foods");