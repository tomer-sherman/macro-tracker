import OpenAI from "openai";
import { appConfig } from "../utils/app-config";

class GptService {

    private openai = new OpenAI({
        apiKey: appConfig.openAiKey
    })

    public async getCompletion(userPrompt: string, systemPrompt: string, data?: string): Promise<string> {

        const response = await this.openai.responses.create({
            model: "gpt-4o-mini",
            instructions: systemPrompt + " " + data,
            input: userPrompt
        })



        const completion = response.output_text;

        return completion;
    }


}

export const gptService = new GptService();