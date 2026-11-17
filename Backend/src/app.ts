import cors from "cors";
import express from "express";
import expressFileUpload from "express-fileupload";
import { mealController } from "./controllers/meal-log-controller";
import { errorMiddleware } from "./middleware/error-middleware";
import { appConfig } from "./utils/app-config";
import mongoose from "mongoose";
import { mealbytimeController } from "./controllers/meal-bytime-controller";
import { authMiddleWare } from "./middleware/auth-middleware";
import { loginController } from "./controllers/login-controller";
import { loggerMiddleware } from "./middleware/logger-middleware";
import { foodDataController } from "./controllers/food-data-controller";
import { securityMiddleware } from "./middleware/security-middleware";

class App {

    public readonly server = express();

    public start(): void {

        // Connect to MongoDB (mongoose buffers queries until connected):
        mongoose.connect(appConfig.mongoConnection)
            .then(() => console.log("Connected to MongoDB"))
            .catch(err => console.error("MongoDB connection failed:", err));

        // Security middleware
        securityMiddleware.registerHeaderAndRateLimit(this.server);

        // System middleware:
        this.server.use(cors({ origin: appConfig.clientUrl }));
        this.server.use(express.json());

        // More security:
        this.server.use(securityMiddleware.preventXss);

        // Log requests
        this.server.use(loggerMiddleware.logToConsole);

        // The only route who doesnt need a logged in user.
        this.server.use(loginController.router);

        // Verify logged in:
        this.server.use(authMiddleWare.verifyLoggedIn);

        // Register controllers:
        this.server.use(mealController.router);
        this.server.use(mealbytimeController.router);
        this.server.use(foodDataController.router);

        // Register "after" middleware:
        this.server.use(errorMiddleware.routeNotFound);
        this.server.use(errorMiddleware.catchAll);

        // Listen only locally, Vercel runs the server itself:
        if (!process.env.VERCEL) {
            this.server.listen(appConfig.port, () => console.log("Listening..."));
        }
    }
}

const app = new App();
app.start();

export default app.server;

// taskkill /F /IM node.exe
