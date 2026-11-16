import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserModel } from "../models/user-model";
import { tokenUtil } from "../utils/token-util";

export type UserState = {
    user: UserModel | null;
};

// On refresh, restore the user from the stored token (if still valid):
const initialState: UserState = {
    user: tokenUtil.getStoredUser()
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login(state, action: PayloadAction<UserModel>) {
            state.user = action.payload;
        },
        logout(state) {
            state.user = null;
        }
    }
});

export const userActions = userSlice.actions;
