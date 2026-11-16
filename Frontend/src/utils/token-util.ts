import { jwtDecode } from "jwt-decode";
import { UserModel } from "../models/user-model";

type TokenPayload = UserModel & {
    iat?: number;
    exp?: number;
};

class TokenUtil {

    private readonly storageKey = "token";

    public save(token: string): void {
        localStorage.setItem(this.storageKey, token);
    }

    public clear(): void {
        localStorage.removeItem(this.storageKey);
    }

    // Decode a token into the user it belongs to:
    public toUser(token: string): UserModel {
        const payload = jwtDecode<TokenPayload>(token);
        return { userId: payload.userId, username: payload.username };
    }

    // Used on page load / refresh - returns the logged-in user if a valid, non-expired token is stored:
    public getStoredUser(): UserModel | null {
        const token = localStorage.getItem(this.storageKey);
        if (!token) return null;

        try {
            const payload = jwtDecode<TokenPayload>(token);
            const isExpired = payload.exp !== undefined && payload.exp * 1000 <= Date.now();
            if (isExpired) {
                this.clear();
                return null;
            }
            return { userId: payload.userId, username: payload.username };
        }
        catch {
            // Corrupted token:
            this.clear();
            return null;
        }
    }

}

export const tokenUtil = new TokenUtil();
