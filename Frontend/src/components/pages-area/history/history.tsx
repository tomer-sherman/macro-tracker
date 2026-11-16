import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MealModel } from "../../../models/meal-model";
import { mealService } from "../../../services/meal-service";
import { dateUtil } from "../../../utils/date-util";
import { notify } from "../../../utils/notify";
import { MealList } from "../../meals-area/meal-list/meal-list";
import { Calendar } from "../../shared-area/calendar/calendar";
import "./history.css";

// A fetched month: its meals grouped by local date (YYYY-MM-DD), or failed. A month not in the map yet is still loading.
type MonthLogs = { failed: false; byDate: Record<string, MealModel[]> } | { failed: true };

const noMeals: MealModel[] = [];

function groupByDate(meals: MealModel[]): Record<string, MealModel[]> {
    const byDate: Record<string, MealModel[]> = {};
    for (const meal of meals) {
        if (!meal.createdAt) continue;
        const date = dateUtil.toDateKey(new Date(meal.createdAt)); // Browser time zone - the same one the request used.
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(meal);
    }
    return byDate;
}

export function History() {

    const today = dateUtil.todayKey();

    // The selected date lives in the URL (/history?date=2026-11-10) so a refresh keeps it.
    // Missing, invalid or future dates fall back to today:
    const [searchParams, setSearchParams] = useSearchParams();
    const dateParam = searchParams.get("date");
    const isValidParam = dateParam !== null && dateUtil.isDateKey(dateParam) && dateParam <= today;
    const selectedDate = isValidParam ? dateParam : today;
    const selectedMonth = dateUtil.toMonthKey(selectedDate);

    // Clear a bad (or future) date out of the address bar:
    useEffect(() => {
        if (dateParam !== null && !isValidParam) setSearchParams({}, { replace: true });
    }, [dateParam, isValidParam, setSearchParams]);

    // The month on the calendar - can be browsed on its own, and jumps to the selected date whenever that changes
    // (e.g. clicking "History" in the menu while looking at an older date):
    const [visibleMonth, setVisibleMonth] = useState(selectedMonth);
    const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
    if (selectedDate !== prevSelectedDate) {
        setPrevSelectedDate(selectedDate);
        setVisibleMonth(selectedMonth);
    }

    // Fetched months (YYYY-MM) - each month is fetched once, for both the calendar dots and the day's meals:
    const [months, setMonths] = useState<Record<string, MonthLogs>>({});
    const requested = useRef(new Set<string>()); // Loaded, failed or on its way - no duplicate requests.

    useEffect(() => {
        for (const month of [visibleMonth, selectedMonth]) {
            if (requested.current.has(month)) continue;
            requested.current.add(month);

            mealService.getMealsByMonth(month)
                .then(meals => setMonths(prev => ({ ...prev, [month]: { failed: false, byDate: groupByDate(meals) } })))
                .catch((err: any) => {
                    notify.error(err);
                    setMonths(prev => ({ ...prev, [month]: { failed: true } }));
                });
        }
        // `months` is here so a retry (which removes a failed month) fetches that month again.
    }, [visibleMonth, selectedMonth, months]);

    function retry(month: string): void {
        requested.current.delete(month);
        setMonths(prev => {
            const next = { ...prev };
            delete next[month];
            return next;
        });
    }

    function selectDate(date: string): void {
        setSearchParams({ date }, { replace: true });
    }

    function showMonth(month: string): void {
        if (months[month]?.failed) retry(month); // Browsing back to a month that failed tries it again.
        setVisibleMonth(month);
    }

    const visibleLogs = months[visibleMonth];
    const selectedLogs = months[selectedMonth];

    const markedDates = useMemo(
        () => new Set(visibleLogs && !visibleLogs.failed ? Object.keys(visibleLogs.byDate) : []),
        [visibleLogs]
    );

    const dayMeals = selectedLogs && !selectedLogs.failed ? selectedLogs.byDate[selectedDate] ?? noMeals : noMeals;
    const isToday = selectedDate === today;

    return (
        <div className="History">

            <div className="page-title">
                <h2>History</h2>
                <span className="hint">Pick a day to see what you logged.</span>
            </div>

            <div className="sections">

                <section className="card calendar-card" aria-label="Calendar">
                    <Calendar
                        month={visibleMonth}
                        selected={selectedDate}
                        max={today}
                        marked={markedDates}
                        markedLabel="Logged meals"
                        isBusy={!visibleLogs}
                        onSelect={selectDate}
                        onMonthChange={showMonth}
                    />
                </section>

                <MealList
                    title={isToday ? "Today" : dateUtil.toLongDate(selectedDate)}
                    meals={dayMeals}
                    isLoading={!selectedLogs}
                    loadFailed={selectedLogs?.failed ?? false}
                    emptyText={isToday ? "No meals logged today yet." : "No meals logged on this day."}
                    failedText="Couldn't load the meals for this day."
                    readOnly
                    onRetry={() => retry(selectedMonth)}
                />

            </div>

        </div>
    );
}
