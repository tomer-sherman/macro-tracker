import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MealStatsModel } from "../../../models/meal-stats-model";
import { mealService } from "../../../services/meal-service";
import { dateUtil } from "../../../utils/date-util";
import { notify } from "../../../utils/notify";
import { StatsGranularity, StatsRange, statsUtil } from "../../../utils/stats-util";
import { LineChart } from "../../shared-area/line-chart/line-chart";
import { SegmentedControl } from "../../shared-area/segmented-control/segmented-control";
import { Skeleton } from "../../shared-area/skeleton/skeleton";
import { StatusPanel } from "../../shared-area/status-panel/status-panel";
import { StatsSummary } from "../../stats-area/stats-summary/stats-summary";
import { StatsTable } from "../../stats-area/stats-table/stats-table";
import "./stats.css";

const DEFAULT_RANGE: StatsRange = "1w";

// What one point on the charts is:
const pointMeaning: Record<StatsGranularity, string> = {
    day: "Total per day",
    week: "Average per day, by week",
    month: "Average per day, by month"
};

const rangeOptions = statsUtil.rangeKeys.map(value => ({
    value,
    label: statsUtil.ranges[value].label,
    fullLabel: statsUtil.ranges[value].name
}));

// A loaded range - stays on screen (dimmed) while the next range loads, so nothing jumps:
type LoadedStats = {
    key: string; // The request it answers.
    range: StatsRange;
    firstDay: string;
    lastDay: string;
    stats: MealStatsModel;
};

export function Stats() {

    // The range lives in the URL (/stats?range=1m) so a refresh keeps it. Missing or invalid -> 1 week:
    const [searchParams, setSearchParams] = useSearchParams();
    const rangeParam = searchParams.get("range");
    const range = statsUtil.isRange(rangeParam) ? rangeParam : DEFAULT_RANGE;

    // Clear a bad range out of the address bar:
    useEffect(() => {
        if (rangeParam !== null && !statsUtil.isRange(rangeParam)) setSearchParams({}, { replace: true });
    }, [rangeParam, setSearchParams]);

    // Every range ends today:
    const today = dateUtil.todayKey();
    const firstDay = statsUtil.firstDay(range, today);

    const [attempt, setAttempt] = useState(0); // "Try again" bumps it, which refetches.
    const requestKey = `${range}|${firstDay}|${today}|${attempt}`;

    const [loaded, setLoaded] = useState<LoadedStats | null>(null);
    const [failedKey, setFailedKey] = useState<string | null>(null);
    const isLoading = loaded?.key !== requestKey && failedKey !== requestKey;
    const loadFailed = failedKey === requestKey;

    // Fetch the selected range. Picking another range before it arrives cancels this request:
    useEffect(() => {
        const controller = new AbortController();

        mealService.getStatsByRange(firstDay, today, controller.signal)
            .then(stats => setLoaded({ key: requestKey, range, firstDay, lastDay: today, stats }))
            .catch((err: any) => {
                if (axios.isCancel(err)) return;
                notify.error(err);
                setFailedKey(requestKey);
            });

        return () => controller.abort();
    }, [requestKey, range, firstDay, today]);

    // The loaded days -> chart points + range averages:
    const view = useMemo(() => {
        if (!loaded) return null;
        const { range, firstDay, lastDay, stats } = loaded;
        const logs = stats.logs.filter(log => log.date >= firstDay && log.date <= lastDay);
        const buckets = statsUtil.buckets(range, firstDay, lastDay, logs);
        return {
            range,
            buckets,
            summary: statsUtil.summary(firstDay, lastDay, logs),
            hasData: logs.length > 0,
            labels: buckets.map(bucket => statsUtil.axisLabel(bucket, range)),
            details: buckets.map(bucket => statsUtil.periodName(bucket, range)),
            notes: buckets.map(bucket => statsUtil.loggedNote(bucket))
        };
    }, [loaded]);

    function selectRange(value: StatsRange): void {
        setSearchParams({ range: value }, { replace: true });
    }

    return (
        <div className="Stats">

            <div className="page-title">
                <h2>Stats</h2>
                <span className="period">{statsUtil.spanName({ start: firstDay, end: today })}</span>
            </div>

            {/* One filter row, above everything it scopes: */}
            <div className="filters">
                <SegmentedControl label="Range" options={rangeOptions} value={range} onChange={selectRange} />
            </div>

            {loadFailed && (
                <section className="card">
                    <StatusPanel kind="failed" text="Couldn't load your stats.">
                        <button type="button" className="btn-secondary" onClick={() => setAttempt(n => n + 1)}>Try again</button>
                    </StatusPanel>
                </section>
            )}

            {!loadFailed && !view && (
                <section className="card">
                    <Skeleton rows={2} label="Loading stats..." />
                </section>
            )}

            {!loadFailed && view && (
                <div className="stats-content" aria-busy={isLoading}>

                    {!view.hasData && (
                        <section className="card">
                            <StatusPanel kind="empty" text={`No meals logged in the last ${statsUtil.ranges[view.range].name}.`} />
                        </section>
                    )}

                    {view.hasData && (
                        <>
                            <section aria-label="Averages">
                                <p className="section-label">Average per day</p>
                                <StatsSummary summary={view.summary} />
                            </section>

                            <div className="charts">

                                <section className="card chart-card" aria-labelledby="stats-calories-title">
                                    <h3 id="stats-calories-title">Calories</h3>
                                    <p className="caption">{pointMeaning[statsUtil.ranges[view.range].granularity]}</p>
                                    <LineChart
                                        title="Calories"
                                        unit="kcal"
                                        labels={view.labels}
                                        details={view.details}
                                        notes={view.notes}
                                        area
                                        series={[
                                            { key: "calories", label: "Calories", tone: "calories", shape: "circle", values: view.buckets.map(b => b.calories) }
                                        ]}
                                    />
                                </section>

                                <section className="card chart-card" aria-labelledby="stats-macros-title">
                                    <h3 id="stats-macros-title">Macros</h3>
                                    <p className="caption">{pointMeaning[statsUtil.ranges[view.range].granularity]}</p>
                                    <LineChart
                                        title="Macros"
                                        unit="g"
                                        labels={view.labels}
                                        details={view.details}
                                        notes={view.notes}
                                        series={[
                                            { key: "protein", label: "Protein", tone: "protein", shape: "circle", values: view.buckets.map(b => b.protein) },
                                            { key: "carbs", label: "Carbs", tone: "carbs", shape: "square", values: view.buckets.map(b => b.carbs) },
                                            { key: "fat", label: "Fat", tone: "fat", shape: "diamond", values: view.buckets.map(b => b.fats) }
                                        ]}
                                    />
                                </section>

                            </div>

                            <section className="card">
                                <StatsTable range={view.range} buckets={view.buckets} />
                            </section>
                        </>
                    )}

                </div>
            )}

        </div>
    );
}
