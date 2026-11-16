import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MealModel } from "../models/meal-model";

export type MealsState = {
    meals: MealModel[];      // Oldest first.
    loadedFor: string | null; // The date (YYYY-MM-DD) the meals were fetched for, null = not fetched yet.
};

const initialState: MealsState = {
    meals: [],
    loadedFor: null
};

export const mealsSlice = createSlice({
    name: "meals",
    initialState,
    reducers: {
        initMeals(state, action: PayloadAction<{ meals: MealModel[]; date: string }>) {
            state.meals = action.payload.meals;
            state.loadedFor = action.payload.date;
        },
        addMeal(state, action: PayloadAction<MealModel>) {
            state.meals.push(action.payload); // Ascending - the newest meal goes at the bottom.
        },
        removeMeal(state, action: PayloadAction<string>) {
            state.meals = state.meals.filter(meal => meal._id !== action.payload);
        },
        clearMeals(state) {
            state.meals = [];
            state.loadedFor = null;
        }
    }
});

export const mealsActions = mealsSlice.actions;
