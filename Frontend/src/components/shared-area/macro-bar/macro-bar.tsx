import { CSSProperties } from "react";
import { MacroTone } from "../macro-chip/macro-chip";
import { Readout } from "../readout/readout";
import "./macro-bar.css";

type MacroBarProps = {
    label: string;     // Always shown - color is never the only cue.
    tone: MacroTone;
    value: number;
    unit: string;
    goal?: number;     // Set -> fills value / goal and reads "value / goal".
    share?: number;    // No goal -> fills by this 0-1 share and reads it as a %.
    shareLabel?: string; // What the share means, e.g. "of energy" (screen readers + tooltip).
};

// A macro's segmented progress bar with a mono value readout:
export function MacroBar({ label, tone, value, unit, goal, share = 0, shareLabel }: MacroBarProps) {

    const fill = goal !== undefined ? (goal > 0 ? Math.min(value / goal, 1) : 0) : Math.min(Math.max(share, 0), 1);

    return (
        <div className={`MacroBar tone-${tone}`}>

            <div className="macro-bar-head">
                <span className="macro-bar-label">{label}</span>
                <span className="macro-bar-readout">
                    <Readout value={value} unit={unit} size="sm" countUp />
                    {goal !== undefined
                        ? <span className="macro-bar-meta">/ <span className="num">{Math.round(goal)}</span></span>
                        : <span className="macro-bar-meta" title={shareLabel}>
                            <span className="num">{Math.round(fill * 100)}%</span>
                            {shareLabel && <span className="visually-hidden"> {shareLabel}</span>}
                        </span>}
                </span>
            </div>

            <div className="macro-bar-track" aria-hidden="true">
                <div className="macro-bar-fill" style={{ "--fill": fill } as CSSProperties} />
            </div>

        </div>
    );
}
