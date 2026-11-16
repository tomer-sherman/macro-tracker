import axios from "axios";
import { CredentialsModel } from "../models/credentials-model";
import { mealsActions } from "../redux/meals-slice";
import { store } from "../redux/store";
import { userActions } from "../redux/user-slice";
import { appConfig } from "../utils/app-config";
import { tokenUtil } from "../utils/token-util";

class UserService {

    // POST /api/login -> returns the JWT as a plain JSON string:
    public async login(credentials: CredentialsModel): Promise<void> {
        const response = await axios.post<string>(appConfig.loginUrl, credentials);
        const token = response.data;

        tokenUtil.save(token);
        store.dispatch(userActions.login(tokenUtil.toUser(token)));
    }

    public logout(): void {
        tokenUtil.clear();
        store.dispatch(userActions.logout());
        store.dispatch(mealsActions.clearMeals());
    }

}

export const userService = new UserService();
