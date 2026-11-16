// One logged day in GET /api/meals-stats-by-range - the totals of that day's meals.
// Days with no meals aren't listed:
export type DayStatsModel = {
    date: string; // YYYY-MM-DD, in the request's time zone.
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    sugars: number;
};

// GET /api/meals-stats-by-range?timeZone=...&startDate=...&endDate=...
export type MealStatsModel = {
    _id: string;          // The range label, "startDate / endDate".
    avgCalories: number;  // avg* = range total / totalDays.
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
    avgSugars: number;
    daysLogged: number;
    totalDays: number;
    logs: DayStatsModel[]; // Oldest first.
};
