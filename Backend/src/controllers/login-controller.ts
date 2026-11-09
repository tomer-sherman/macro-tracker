import express, { Request, Response, Router } from "express"
import { IUserModel, UserModel } from "../models/user-model";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";
import { security } from "../utils/security/security";

type CredentialModel = {
    username: string,
    password: string
}

class LoginController {

    public router: Router = express.Router();

    public constructor() {
        this.router.post("/api/login", this.routeToLogin)
    }

    private async routeToLogin(request: Request, response: Response): Promise<void> {
        const credentials: CredentialModel = request.body;
        const jwt = await login(credentials);
        response.json(jwt);
    }

}

async function login(creds: CredentialModel): Promise<string> {

    console.log("Entered login!!!!")
    // Find user
    const userArr = await UserModel.find({ username: creds.username }).exec() as IUserModel[];
    console.log(userArr);
    if (userArr.length === 0) throw new ClientError(StatusCode.BadRequest, "Username or password incorrect.")
    console.log(userArr);
    const user = userArr[0];

    // Extract hash from user
    const dbHash = user.password;

    // Check if the hash is valid
    const isValid = await security.verifyPassword(dbHash, creds.password);
    if (!isValid) throw new ClientError(StatusCode.BadRequest, "Username or password incorrect.");

    const jwt = await security.getNewToken(user);
    return jwt;

}


export const loginController = new LoginController()