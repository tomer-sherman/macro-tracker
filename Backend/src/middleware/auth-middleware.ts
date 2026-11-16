import { NextFunction, Request, Response } from "express";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";
import { security } from "../utils/security/security";


class AuthMiddleWare {

    public async verifyLoggedIn(request: Request, response: Response, next: NextFunction): Promise<void> {
        const token = request.headers.authorization?.substring(7);
        const userPayload = await security.verifyToken(token!);
        request.userId = userPayload.userId;
        next()
    }



}

export const authMiddleWare = new AuthMiddleWare()
