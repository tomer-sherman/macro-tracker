import { DayStatsModel } from "../models/meal-stats-model";
import { dateUtil } from "./date-util";

export type StatsRange = "1w" | "2w" | "1m" | "6m" | "1y";
export type StatsGranularity = "day" | "week" | "month";

type RangeInfo = {
    label: string;               // Short, for the range picker, e.g. "1M".
    name: string;                // Full, e.g. "1 month".
    granularity: StatsGranularity; // What one point on the chart is.
};

type DaySpan = {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD, included.
};

// The stats of a span of days (one chart point, or the whole range) - averages per day:
export type StatsBucket = DaySpan & {
    days: number;       // Days in the span (cut to the range - the oldest week / current month can be shorter).
    daysLogged: number; // Days in the span that have meals.
    // Average per day over ALL the span's days - a day with no meals counts as 0, like the backend's averages.
    // null = nothing logged in the span, drawn as a gap (not a 0):
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fats: number | null;
    sugars: number | null;
};

type StatKey = "calories" | "protein" | "carbs" | "fats" | "sugars";
const statKeys: StatKey[] = ["calories", "protein", "carbs", "fats", "sugars"];

class StatsUtil {

    public readonly ranges: Record<StatsRange, RangeInfo> = {
        "1w": { label: "1W", name: "1 week", granularity: "day" },
        "2w": { label: "2W", name: "2 weeks", granularity: "day" },
        "1m": { label: "1M", name: "1 month", granularity: "week" },
        "6m": { label: "6M", name: "6 months", granularity: "month" },
        "1y": { label: "1Y", name: "1 year", granularity: "month" }
    };

    public readonly rangeKeys = Object.keys(this.ranges) as StatsRange[];

    public isRange(value: string | null): value is StatsRange {
        return value !== null && (this.rangeKeys as string[]).includes(value);
    }

    // The first day of a range that ends on `lastDay` (today):
    public firstDay(range: StatsRange, lastDay: string): string {
        const thisMonth = dateUtil.toMonthKey(lastDay);
        switch (range) {
            case "1w": return dateUtil.addDays(lastDay, -6);
            case "2w": return dateUtil.addDays(lastDay, -13);
            case "1m": return dateUtil.addDays(dateUtil.shiftMonths(lastDay, -1), 1); // Nov 16 -> from Oct 17.
            case "6m": return `${dateUtil.addMonths(thisMonth, -5)}-01`;  // Whole months: this one + the 5 before it.
            case "1y": return `${dateUtil.addMonths(thisMonth, -11)}-01`; // This month + the 11 before it.
        }
    }

    // One bucket per chart point - a day, a week (counted back from lastDay) or a calendar month:
    public buckets(range: StatsRange, firstDay: string, lastDay: string, logs: DayStatsModel[]): StatsBucket[] {
        const spans = {
            day: () => this.daySpans(firstDay, lastDay),
            week: () => this.weekSpans(firstDay, lastDay),
            month: () => this.monthSpans(firstDay, lastDay)
        }[this.ranges[range].granularity]();

        return spans.map(span => this.aggregate(span, logs));
    }

    // The whole range as one bucket:
    public summary(firstDay: string, lastDay: string, logs: DayStatsModel[]): StatsBucket {
        return this.aggregate({ start: firstDay, end: lastDay }, logs);
    }

    // X-axis label of a bucket, e.g. "Mon", "Nov 10", "Nov":
    public axisLabel(bucket: StatsBucket, range: StatsRange): string {
        const start = dateUtil.fromDateKey(bucket.start);
        if (range === "1w") return start.toLocaleDateString(undefined, { weekday: "short" });
        if (this.ranges[range].granularity === "month") return start.toLocaleDateString(undefined, { month: "short" });
        return start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }

    // Full name of a bucket's period, e.g. "Monday, Nov 10", "Nov 10 – Nov 16", "November 2026":
    public periodName(bucket: StatsBucket, range: StatsRange): string {
        const start = dateUtil.fromDateKey(bucket.start);
        switch (this.ranges[range].granularity) {
            case "day": return start.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
            case "week": return this.spanName(bucket);
            case "month": return start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
        }
    }

    // e.g. "Oct 17 – Nov 16" (adds the years when the span crosses one):
    public spanName({ start, end }: DaySpan): string {
        const sameYear = start.slice(0, 4) === end.slice(0, 4);
        const options: Intl.DateTimeFormatOptions = sameYear
            ? { month: "short", day: "numeric" }
            : { month: "short", day: "numeric", year: "numeric" };
        const format = (dateKey: string) => dateUtil.fromDateKey(dateKey).toLocaleDateString(undefined, options);
        return start === end ? format(start) : `${format(start)} – ${format(end)}`;
    }

    // Tooltip footnote, e.g. "3 of 7 days logged" - empty for a single day that has meals (nothing to add):
    public loggedNote(bucket: StatsBucket): string {
        if (bucket.days === 1) return bucket.daysLogged === 1 ? "" : "Nothing logged";
        return `${bucket.daysLogged} of ${bucket.days} days logged`;
    }

    private daySpans(firstDay: string, lastDay: string): DaySpan[] {
        const spans: DaySpan[] = [];
        for (let day = firstDay; day <= lastDay; day = dateUtil.addDays(day, 1)) {
            spans.push({ start: day, end: day });
        }
        return spans;
    }

    // 7-day weeks ending on lastDay, so the latest point is always a full week - only the oldest can be shorter:
    private weekSpans(firstDay: string, lastDay: string): DaySpan[] {
        const spans: DaySpan[] = [];
        for (let end = lastDay; end >= firstDay; end = dateUtil.addDays(end, -7)) {
            const weekStart = dateUtil.addDays(end, -6);
            spans.unshift({ start: weekStart < firstDay ? firstDay : weekStart, end });
        }
        return spans;
    }

    // Calendar months, the current one cut at lastDay:
    private monthSpans(firstDay: string, lastDay: string): DaySpan[] {
        const spans: DaySpan[] = [];
        const lastMonth = dateUtil.toMonthKey(lastDay);
        for (let month = dateUtil.toMonthKey(firstDay); month <= lastMonth; month = dateUtil.addMonths(month, 1)) {
            const monthStart = `${month}-01`;
            const monthEnd = dateUtil.addDays(`${dateUtil.addMonths(month, 1)}-01`, -1);
            spans.push({
                start: monthStart < firstDay ? firstDay : monthStart,
                end: monthEnd > lastDay ? lastDay : monthEnd
            });
        }
        return spans;
    }

    private aggregate(span: DaySpan, logs: DayStatsModel[]): StatsBucket {
        const days = dateUtil.daysBetween(span.start, span.end) + 1;
        const logged = logs.filter(log => log.date >= span.start && log.date <= span.end);

        const bucket: StatsBucket = { ...span, days, daysLogged: logged.length, calories: null, protein: null, carbs: null, fats: null, sugars: null };
        if (logged.length === 0) return bucket;

        for (const key of statKeys) {
            bucket[key] = logged.reduce((sum, log) => sum + (log[key] ?? 0), 0) / days;
        }
        return bucket;
    }

}

export const statsUtil = new StatsUtil();
