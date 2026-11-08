import cors from "cors";
import express from "express";
import expressFileUpload from "express-fileupload";
import { mealController } from "./controllers/meal-log-controller";
import { errorMiddleware } from "./middleware/error-middleware";
import { appConfig } from "./utils/app-config";
import mongoose from "mongoose";
import { mealbytimeController } from "./controllers/meal-bytime-controller";

class App {

    public async start(): Promise<void> {

        await mongoose.connect(appConfig.mongoConnection)

        // Create our server object:
        const server = express();

        // System middleware:
        server.use(cors()); // Enable CORS.
        server.use(express.json()); // Configure express to create request.body from a given JSON.
        server.use(expressFileUpload()); // Configure express to create request.files from the request.


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
