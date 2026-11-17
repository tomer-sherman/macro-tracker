class AppConfig {

    private readonly baseUrl = import.meta.env.VITE_API_URL! as string;

    public readonly loginUrl = this.baseUrl + "login";
    public readonly mealsUrl = this.baseUrl + "meals";
    public readonly mealsByDateRangeUrl = this.baseUrl + "meals-by-date-range";
    public readonly aiAutofillUrl = this.baseUrl + "ai-autofill";
    public readonly foodDataUrl = this.baseUrl + "food-data";
    public readonly foodByDescUrl = this.baseUrl + "food-by-desc";

    public readonly recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
}

export const appConfig = new AppConfig();
