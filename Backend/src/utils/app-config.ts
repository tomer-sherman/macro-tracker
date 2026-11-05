import dotenv from "dotenv"; // npm install dotenv

// Loads .env values into: process.env object:
dotenv.config({ quiet: true });

class AppConfig {

   
    public readonly port = 4000;
    public readonly mongoConnection = process.env.MONGO_CONNECTION_STRING!;
   

}

export const appConfig = new AppConfig();
