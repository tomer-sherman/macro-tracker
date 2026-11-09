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

class App {

    public async start(): Promise<void> {

        await mongoose.connect(appConfig.mongoConnection)

        // Create our server object:
        const server = express();

        // System middleware:
        server.use(cors()); // Enable CORS.
        server.use(express.json()); // Configure express to create request.body from a given JSON.

        // Log requests
        server.use(loggerMiddleware.logToConsole);

        // The only route who doesnt need a logged in user.
        server.use(loginController.router);

        //Verify logged in:
        server.use(authMiddleWare.verifyLoggedIn);

        // Register controllers:
        server.use(mealController.router);
        server.use(mealbytimeController.router);

        // Register "after" middleware:
        server.use(errorMiddleware.routeNotFound);
        server.use(errorMiddleware.catchAll);

        // Run server:
        server.listen(appConfig.port, () => console.log("Listening..."));
    }

}

const app = new App();
app.start();

// taskkill /F /IM node.exe
