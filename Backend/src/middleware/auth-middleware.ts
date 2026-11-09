import { NextFunction, Request, Response } from "express";
import { ClientError } from "../utils/error-handeling/client-error";
import { StatusCode } from "../utils/error-handeling/enums";
import { security } from "../utils/security/security";

class AuthMiddleWare {

    public async verifyLoggedIn(request: Request, response: Response, next: NextFunction): Promise<void> {
        const token = request.headers.authorization?.substring(7);
        const isValid = await security.verifyToken(token!);
        
        if (!isValid) throw new ClientError(StatusCode.Unauthorized, "You are not logged in.")
        next()
    }



}

export const authMiddleWare = new AuthMiddleWare()
