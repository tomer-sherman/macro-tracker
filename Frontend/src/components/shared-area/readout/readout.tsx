import { useEffect, useRef, useState } from "react";
import { mealUtil } from "../../../utils/meal-util";
import "./readout.css";

type ReadoutProps = {
    value: number | null | undefined; // null / undefined shows "—".
    unit?: string;
    size?: "sm" | "md" | "lg" | "xl";
    countUp?: boolean; // Counts from the previous value to the new one. Skipped with reduced motion.
};

// The count-up length comes from the --duration-slow token (0ms under prefers-reduced-motion):
function countUpMs(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--duration-slow").trim();
    const amount = parseFloat(raw) || 0;
    return raw.endsWith("ms") ? amount : amount * 1000;
}

// The number to show right now - eases from the last shown value to `target`:
function useCountUp(target: number, enabled: boolean): number {

    // Starts at 0 so the first value counts up too (unless motion is off):
    const [animated, setAnimated] = useState<number | null>(() => (enabled && countUpMs() > 0 ? 0 : null));
    const shown = useRef(animated ?? target);

    useEffect(() => {
        const duration = countUpMs();
        const from = shown.current;
        if (!enabled || duration === 0 || from === target) return;

        const start = performance.now();
        let frame = requestAnimationFrame(function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const value = from + (target - from) * (1 - (1 - progress) ** 3); // Ease-out.
            shown.current = value;
            setAnimated(progress < 1 ? value : null);
            if (progress < 1) frame = requestAnimationFrame(tick);
        });

        return () => cancelAnimationFrame(frame);
    }, [target, enabled]);

    return animated ?? target;
}

// A number in mono + tabular figures, with an optional small uppercase unit:
export function Readout({ value, unit, size = "md", countUp = false }: ReadoutProps) {

    const hasValue = value !== null && value !== undefined;
    const shown = useCountUp(hasValue ? value : 0, countUp && hasValue);

    return (
        <span className={`Readout size-${size}`}>
            <span className="readout-value num">{mealUtil.format(hasValue ? shown : value)}</span>
            {unit && hasValue && <span className="readout-unit">{unit}</span>}
        </span>
    );
}
