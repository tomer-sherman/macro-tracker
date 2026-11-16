import { CSSProperties } from "react";
import { MacroTone } from "../macro-chip/macro-chip";
import { Readout } from "../readout/readout";
import "./gauge.css";

type GaugeSlice = {
    tone: MacroTone;
    value: number;
};

type GaugeProps = {
    value: number;       // The center readout, e.g. kcal eaten.
    unit: string;        // e.g. "kcal".
    label: string;       // Caption under the readout, e.g. "Total".
    goal?: number;       // Set -> the ring fills value / goal in the calories tone, and the center shows "/ goal".
    split?: GaugeSlice[]; // No goal -> the ring is shared out between the slices, in order (e.g. each macro's energy).
};

// SVG geometry, in viewBox units (0 0 200 200):
const CENTER = 100;
const SEGMENTS = 48;
const SEGMENT_GAP_DEG = 2.5;
const RING_RADIUS = 84;
const TICKS = 60;
const MAJOR_TICK_EVERY = 5;
const TICK_OUTER = 99;
const TICK_INNER_MINOR = 95;
const TICK_INNER_MAJOR = 92;
const INNER_RING_RADIUS = 72;

// A point on a circle, angle in degrees clockwise from 12 o'clock:
function point(radius: number, angleDeg: number): [number, number] {
    const rad = (angleDeg * Math.PI) / 180;
    return [CENTER + radius * Math.sin(rad), CENTER - radius * Math.cos(rad)];
}

function arcPath(radius: number, fromDeg: number, toDeg: number): string {
    const [x0, y0] = point(radius, fromDeg);
    const [x1, y1] = point(radius, toDeg);
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${radius} ${radius} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

const segmentPaths = Array.from({ length: SEGMENTS }, (_, i) => {
    const step = 360 / SEGMENTS;
    return arcPath(RING_RADIUS, i * step + SEGMENT_GAP_DEG / 2, (i + 1) * step - SEGMENT_GAP_DEG / 2);
});

const ticks = Array.from({ length: TICKS }, (_, i) => {
    const angle = (i * 360) / TICKS;
    const isMajor = i % MAJOR_TICK_EVERY === 0;
    const [x1, y1] = point(isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR, angle);
    const [x2, y2] = point(TICK_OUTER, angle);
    return { x1, y1, x2, y2, isMajor };
});

// Each segment's tone, or null when unlit:
function segmentTones(value: number, goal?: number, split?: GaugeSlice[]): (MacroTone | null)[] {
    if (goal !== undefined) {
        const ratio = goal > 0 ? Math.min(value / goal, 1) : 0;
        const lit = value > 0 ? Math.max(1, Math.round(ratio * SEGMENTS)) : 0;
        return Array.from({ length: SEGMENTS }, (_, i) => (i < lit ? "calories" : null));
    }

    const slices = split ?? [];
    const total = slices.reduce((sum, slice) => sum + Math.max(slice.value, 0), 0);
    if (total <= 0) return Array(SEGMENTS).fill(null);

    // Largest remainder - whole segments that always add up to SEGMENTS:
    const exact = slices.map(slice => (Math.max(slice.value, 0) / total) * SEGMENTS);
    const counts = exact.map(Math.floor);
    let left = SEGMENTS - counts.reduce((sum, count) => sum + count, 0);
    const byRemainder = exact.map((amount, i) => ({ i, remainder: amount - counts[i] })).sort((a, b) => b.remainder - a.remainder);
    for (const { i } of byRemainder) {
        if (left === 0) break;
        counts[i]++;
        left--;
    }

    return slices.flatMap((slice, i) => Array<MacroTone>(counts[i]).fill(slice.tone));
}

// Circular, segmented instrument gauge with tick marks and a mono readout in the middle:
export function Gauge({ value, unit, label, goal, split }: GaugeProps) {

    const tones = segmentTones(value, goal, split);
    const offTone: MacroTone = goal !== undefined ? "calories" : "neutral";

    const segments = (layer: string) => segmentPaths.map((d, i) => (
        <path
            key={`${layer}-${i}`}
            d={d}
            className={`gauge-seg tone-${tones[i] ?? offTone}`}
            data-lit={tones[i] !== null}
            style={{ "--i": i } as CSSProperties}
        />
    ));

    return (
        <div className="Gauge">

            <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
                <g className="gauge-ticks">
                    {ticks.map((tick, i) => (
                        <line
                            key={i}
                            x1={tick.x1.toFixed(2)}
                            y1={tick.y1.toFixed(2)}
                            x2={tick.x2.toFixed(2)}
                            y2={tick.y2.toFixed(2)}
                            className={tick.isMajor ? "major" : undefined}
                        />
                    ))}
                </g>
                <circle className="gauge-inner-ring" cx={CENTER} cy={CENTER} r={INNER_RING_RADIUS} />
                {/* A blurred copy under the ring - the lit segments glow in their own color: */}
                <g className="gauge-glow">{segments("glow")}</g>
                <g className="gauge-segments">{segments("seg")}</g>
            </svg>

            <div className="gauge-center">
                <Readout value={value} size="xl" countUp />
                <span className="gauge-unit">
                    {goal !== undefined && <>/ <span className="num">{Math.round(goal)}</span> </>}
                    {unit}
                </span>
                <span className="gauge-label">{label}</span>
            </div>

        </div>
    );
}
