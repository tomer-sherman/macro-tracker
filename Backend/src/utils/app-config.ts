import dotenv from "dotenv"; // npm install dotenv

// Loads .env values into: process.env object:
dotenv.config({ quiet: true });

class AppConfig {


    public readonly port = 4000;
    public readonly mongoConnection = process.env.MONGO_CONNECTION_STRING!;

    // host domain:
    public readonly clientUrl = process.env.CLIENT_URL!;

    public readonly openAiKey = process.env.OPENAI_API_KEY!;
    public readonly jwtSecret = process.env.JWT_SECRET!;

    public readonly enviorment = process.env.NODE_ENV!;
    public readonly isProd = this.enviorment !== "dev";
}

export const appConfig = new AppConfig();
