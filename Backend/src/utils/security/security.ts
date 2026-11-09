
import { hash, verify } from "argon2";
import { appConfig } from "../app-config";
import { jwtVerify, SignJWT } from "jose";
import { IUserModel } from "../../models/user-model";

type UserPayload = {
    userId: string,
    username: string
}

class Security {

    private jwtSecret = new TextEncoder().encode(appConfig.jwtSecret);

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

        const jwt = new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(this.jwtSecret)

        return jwt;
    }

    public async verifyToken(token: string): Promise<boolean> {
        try {
            await jwtVerify<UserPayload>(token, this.jwtSecret);
            return true
        }
        catch (err: any) {
            return false
        }
    }

}

export const security = new Security();