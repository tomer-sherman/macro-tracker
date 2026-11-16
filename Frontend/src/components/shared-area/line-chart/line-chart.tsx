import { KeyboardEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { mealUtil } from "../../../utils/meal-util";
import { MacroTone } from "../macro-chip/macro-chip";
import "./line-chart.css";

// The marker shape is a second cue next to color, for color-blind readers - give each series its own:
export type ChartShape = "circle" | "square" | "diamond";

export type ChartSeries = {
    key: string;
    label: string;
    tone: MacroTone;
    shape: ChartShape;
    values: (number | null)[]; // One per point. null = no data -> a gap in the line, not a 0.
};

type LineChartProps = {
    title: string;       // Names the chart for screen readers (the visible heading is the caller's).
    unit: string;        // The one unit every series shares - one y-axis only, never two.
    labels: string[];    // X-axis label per point.
    details: string[];   // Tooltip heading per point, e.g. "Nov 10 – Nov 16".
    notes?: string[];    // Tooltip footnote per point, e.g. "3 of 7 days logged".
    series: ChartSeries[];
    area?: boolean;      // A soft wash under the line - for a single series.
};

// Plot geometry in px (strokes, colors and fonts come from tokens via the CSS):
const PAD = { top: 12, right: 20, bottom: 28, left: 44 };
const TICK_COUNTS = [4, 5, 3]; // Gridline steps to try - the first one wins a tie.
const MARKER_R = 4;
const ACTIVE_R = 6;
const LABEL_CHAR_WIDTH = 6.8; // ~ one mono digit at --text-2xs, to space the x labels.
const LABEL_PAD = 12;
const Y_LABEL_GAP = 8;

// The tightest round top for the y-axis, in clean steps (1, 2, 2.5 or 5 x 10^n):
function niceScale(max: number): { top: number; step: number } {
    if (!(max > 0)) return { top: TICK_COUNTS[0], step: 1 };
    let best = { top: Infinity, step: 1 };
    for (const ticks of TICK_COUNTS) {
        const rough = max / ticks;
        const magnitude = 10 ** Math.floor(Math.log10(rough));
        const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= rough) ?? 10 * magnitude;
        if (step * ticks < best.top) best = { top: step * ticks, step };
    }
    return best;
}

const tickFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

// Path of a marker shape centered on (x, y):
function markerPath(shape: ChartShape, x: number, y: number, r: number): string {
    if (shape === "square") {
        const h = r * 0.9;
        return `M ${x - h} ${y - h} H ${x + h} V ${y + h} H ${x - h} Z`;
    }
    if (shape === "diamond") {
        const h = r * 1.25;
        return `M ${x} ${y - h} L ${x + h} ${y} L ${x} ${y + h} L ${x - h} ${y} Z`;
    }
    return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
}

// The width + height of an element, kept up to date:
function useSize<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return [ref, size] as const;
}

// Line chart over time - crosshair + tooltip on hover / touch, arrow keys to read it with the keyboard:
export function LineChart({ title, unit, labels, details, notes, series, area = false }: LineChartProps) {

    const [plotRef, { width, height }] = useSize<HTMLDivElement>();
    const [active, setActive] = useState<number | null>(null);
    const [announcement, setAnnouncement] = useState("");

    const count = labels.length;
    const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
    const plotHeight = Math.max(height - PAD.top - PAD.bottom, 0);
    const baseline = PAD.top + plotHeight;

    const allValues = series.flatMap(s => s.values).filter((value): value is number => value !== null);
    const { top, step } = niceScale(Math.max(0, ...allValues));
    const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

    const x = (i: number) => PAD.left + (count > 1 ? (i * plotWidth) / (count - 1) : plotWidth / 2);
    const y = (value: number) => baseline - (value / top) * plotHeight;

    // Only every n-th x label when they'd crowd (judged by the longest one), always keeping the latest:
    const labelWidth = Math.max(0, ...labels.map(label => label.length)) * LABEL_CHAR_WIDTH + LABEL_PAD;
    const labelEvery = Math.ceil(count / Math.max(2, Math.floor(plotWidth / labelWidth)));

    // The line, broken where there's no data (and the area under each unbroken run):
    function paths(values: (number | null)[]): { line: string; fill: string } {
        let line = "";
        let fill = "";
        let run: number[] = [];
        const closeRun = () => {
            if (run.length > 0) fill += `M ${x(run[0])} ${baseline} ${run.map(i => `L ${x(i)} ${y(values[i]!)}`).join(" ")} L ${x(run[run.length - 1])} ${baseline} Z `;
            run = [];
        };
        values.forEach((value, i) => {
            if (value === null) return closeRun();
            line += `${run.length === 0 ? "M" : "L"} ${x(i)} ${y(value)} `;
            run.push(i);
        });
        closeRun();
        return { line, fill };
    }

    function describe(i: number): string {
        const values = series.map(s => `${s.label} ${mealUtil.format(s.values[i])} ${s.values[i] === null ? "" : unit}`.trim());
        return [details[i], values.join(", "), notes?.[i]].filter(Boolean).join(". ");
    }

    // Nearest point to the pointer - the reader aims at a date, not at a 2px line:
    function pointAt(event: PointerEvent<HTMLDivElement>): number {
        const left = event.currentTarget.getBoundingClientRect().left;
        const ratio = count > 1 ? (event.clientX - left - PAD.left) / (plotWidth / (count - 1)) : 0;
        return Math.min(Math.max(Math.round(ratio), 0), count - 1);
    }

    function moveTo(i: number): void {
        setActive(i);
        setAnnouncement(describe(i));
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        const current = active ?? count - 1;
        const moves: Partial<Record<string, number>> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: count - 1 };
        const next = moves[event.key];
        if (next === undefined) return;
        event.preventDefault();
        moveTo(Math.min(Math.max(next, 0), count - 1));
    }

    const tooltipOnRight = active !== null && x(active) < width / 2;

    return (
        <div className="LineChart">

            {/* Two or more series always get a legend - color is never the only key: */}
            {series.length > 1 && (
                <ul className="chart-legend">
                    {series.map(s => (
                        <li key={s.key} className={`tone-${s.tone}`}>
                            <svg className="legend-key" viewBox="-8 -6 16 12" aria-hidden="true">
                                <line x1={-8} y1={0} x2={8} y2={0} />
                                <path d={markerPath(s.shape, 0, 0, MARKER_R)} />
                            </svg>
                            {s.label}
                        </li>
                    ))}
                </ul>
            )}

            <span className="chart-unit">{unit}</span>

            <div
                ref={plotRef}
                className="chart-plot"
                tabIndex={0}
                role="group"
                aria-label={`${title}. Use the left and right arrow keys to read each point.`}
                onPointerMove={event => setActive(pointAt(event))}
                onPointerDown={event => setActive(pointAt(event))}
                onPointerLeave={event => { if (document.activeElement !== event.currentTarget) setActive(null); }}
                onFocus={() => moveTo(active ?? count - 1)}
                onBlur={() => setActive(null)}
                onKeyDown={handleKeyDown}
            >
                {width > 0 && height > 0 && (
                    <svg width={width} height={height} aria-hidden="true" focusable="false">

                        {/* Grid + y-axis: */}
                        <g className="chart-grid">
                            {ticks.map(tick => (
                                <g key={tick}>
                                    <line x1={PAD.left} x2={PAD.left + plotWidth} y1={y(tick)} y2={y(tick)} className={tick === 0 ? "baseline" : undefined} />
                                    <text x={PAD.left - Y_LABEL_GAP} y={y(tick)}>{tickFormat.format(tick)}</text>
                                </g>
                            ))}
                        </g>

                        {/* X-axis labels: */}
                        <g className="chart-x-labels">
                            {labels.map((label, i) => (count - 1 - i) % labelEvery === 0 && (
                                <text key={i} x={x(i)} y={baseline + PAD.bottom - Y_LABEL_GAP} className={i === active ? "active" : undefined}>{label}</text>
                            ))}
                        </g>

                        {active !== null && (
                            <line className="chart-crosshair" x1={x(active)} x2={x(active)} y1={PAD.top} y2={baseline} />
                        )}

                        {/* Data - keyed by the points, so a new range plays the enter animation: */}
                        <g className="chart-data" key={labels.join("|")}>
                            {series.map(s => {
                                const { line, fill } = paths(s.values);
                                return (
                                    <g key={s.key} className={`chart-series tone-${s.tone}`}>
                                        {area && <path className="chart-area" d={fill} />}
                                        <path className="chart-line" d={line} />
                                        {s.values.map((value, i) => value !== null && (
                                            <path
                                                key={i}
                                                className={i === active ? "chart-marker active" : "chart-marker"}
                                                d={markerPath(s.shape, x(i), y(value), i === active ? ACTIVE_R : MARKER_R)}
                                            />
                                        ))}
                                    </g>
                                );
                            })}
                        </g>

                    </svg>
                )}

                {active !== null && (
                    <div
                        className="chart-tooltip"
                        aria-hidden="true"
                        style={tooltipOnRight ? { left: x(active) + Y_LABEL_GAP } : { right: width - x(active) + Y_LABEL_GAP }}
                    >
                        <p className="tooltip-title">{details[active]}</p>
                        <ul>
                            {series.map(s => (
                                <li key={s.key} className={`tone-${s.tone}`}>
                                    <span className="tooltip-key" />
                                    <strong className="num">{mealUtil.format(s.values[active])}</strong>
                                    {s.values[active] !== null && <span className="tooltip-unit">{unit}</span>}
                                    <span className="tooltip-label">{s.label}</span>
                                </li>
                            ))}
                        </ul>
                        {notes?.[active] && <p className="tooltip-note">{notes[active]}</p>}
                    </div>
                )}
            </div>

            {/* Keyboard reading, spoken by screen readers: */}
            <p className="visually-hidden" aria-live="polite">{announcement}</p>

        </div>
    );
}
