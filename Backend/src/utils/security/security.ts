
import { hash, verify } from "argon2";
import { appConfig } from "../app-config";
import { jwtVerify, SignJWT } from "jose";

export type TokenPayload = {
    userId: string;
    role: "User" | "Admin";
};


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

    public getNewToken(payload: TokenPayload): Promise<string> {
        const jwt = new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(this.jwtSecret)

        return jwt;
    }

    public async verifyToken(token: string): Promise<TokenPayload> {
        const { payload } = await jwtVerify<TokenPayload>(token, this.jwtSecret);

        return payload;
    }

}

export const security = new Security();