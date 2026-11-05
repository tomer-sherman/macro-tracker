import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../utils/error-handeling/enums";
import { ClientError } from "../utils/error-handeling/client-error";
import colors from "colors";
import { Error } from "mongoose";



class ErrorMiddleware {

    // Route Not Found Middleware:
    public routeNotFound(request: Request, response: Response, next: NextFunction): void {
        const err = new ClientError(StatusCode.NotFound, `Route ${request.originalUrl} on method ${request.method} not found.`);
        next(err);
    }

    // Catch-All Middleware:
    public catchAll = (err: any, request: Request, response: Response, next: NextFunction): void => {

        // Check for mongoose validation error:
        if (err instanceof Error.ValidationError){this.mongooseValidationError(err, response); return;}

        // Take status
        const status = err.status || StatusCode.InternalServerError;

        // Take message: 
        const message = err.message;

        // Console message: 
        console.log(colors.red(err.message));

        

        // Return back error:
        response.status(status).json({ message });
    };

    private mongooseValidationError(err: Error.ValidationError, response: Response): void {
        const status = StatusCode.UnprocessableContent;
        const message = err.message;
        response.status(status).json({ message });
    }

}

export const errorMiddleware = new ErrorMiddleware();
