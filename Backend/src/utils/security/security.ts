import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import { appConfig } from "../app-config";
import { IUserModel } from "../../models/user-model";
import { ClientError } from "../error-handeling/client-error";
import { StatusCode } from "../error-handeling/enums";

type UserPayload = {
    userId: string,
    username: string
}

class Security {

    private jwtSecret = appConfig.jwtSecret;

    public async hashPassword(password: string): Promise<string> {
        const hashedPass = await hash(password);
        return hashedPass;
    }

    public async verifyPassword(hash: string, password: string): Promise<boolean> {
        const isValid = await verify(hash, password);
        return isValid
    }

    public async getNewToken(user: IUserModel): Promise<string> {
        const payload: UserPayload = {
            userId: user._id.toString(),
            username: user.username
        }

        const token = jwt.sign(payload, this.jwtSecret, { algorithm: "HS256", expiresIn: "1h" });
        return token;
    }

    public async verifyToken(token: string): Promise<UserPayload> {
        try {
            const user = jwt.verify(token, this.jwtSecret, { algorithms: ["HS256"] }) as UserPayload;
            return user;

        } catch (err: any) {
            throw new ClientError(StatusCode.Unauthorized, "You are not logged in.")
        }
    }

}

export const security = new Security();