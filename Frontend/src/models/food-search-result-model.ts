// One result of GET /api/food-data?query=...
// The backend returns only the name matching the query's language: nameEn for English, nameHe for Hebrew.
export type FoodSearchResultModel = {
    nameEn?: string | null;
    nameHe?: string | null;
    matchScore: number;
};
