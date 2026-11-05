import cors from "cors";
import express from "express";
import expressFileUpload from "express-fileupload";
import path from "path";
import { saver } from "smart-saver";
import { dataController } from "./controllers/meal-log-controller";
import { errorMiddleware } from "./middleware/error-middleware";
import { appConfig } from "./utils/app-config";
import mongoose from "mongoose";

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
        server.use(dataController.router);

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
