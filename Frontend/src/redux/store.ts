import { configureStore } from "@reduxjs/toolkit";
import { mealsSlice } from "./meals-slice";
import { userSlice } from "./user-slice";

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        meals: mealsSlice.reducer
    }
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
