import { NextFunction, Request, Response, Express } from "express";
import striptags from "striptags";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";

class SecurityMiddleware {

    public preventXss(request: Request, response: Response, next: NextFunction): void {

        for (const prop in request.body) {

            const value = request.body[prop];

            if (typeof value === "string") {
                request.body[prop] = striptags(value);
            }

        }

        next();
    }

    private registerRateLimit(server: Express): void {
        server.use(expressRateLimit({
            windowMs: 1000,
            limit: 10
        }))
    }

    private headerProtection(server: Express): void {
        server.use(helmet({
            crossOriginResourcePolicy: { policy: "same-origin" }
        }))
    }

    public registerHeaderAndRateLimit(server: Express): void {
        this.registerRateLimit(server);
        this.headerProtection(server)
    }



}

export const securityMiddleware = new SecurityMiddleware();