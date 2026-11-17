// One logged day - the totals of that day's meals, built from the meals on the frontend (statsUtil.dailyTotals).
// Days with no meals aren't listed:
export type DayStatsModel = {
    date: string; // YYYY-MM-DD, the browser's local date.
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    sugars: number;
};
