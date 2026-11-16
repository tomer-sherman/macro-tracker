import { CSSProperties, ReactNode } from "react";
import "./range-slider.css";

type RangeSliderProps = {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    disabled?: boolean;
    onChange: (value: number) => void;
    children?: ReactNode; // Extra live readouts under the track.
};

// A range input with a filled track, a glowing thumb and a live mono readout:
export function RangeSlider({ id, label, value, min, max, step, unit, disabled = false, onChange, children }: RangeSliderProps) {

    const clamped = Math.min(Math.max(value, min), max);
    const fill = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

    return (
        <div className="RangeSlider">

            <div className="range-head">
                <label htmlFor={id}>{label}</label>
                <output htmlFor={id} className="range-value">
                    <span className="num">{Math.round(value * 10) / 10}</span>
                    <span className="range-unit">{unit}</span>
                </output>
            </div>

            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={clamped}
                disabled={disabled}
                aria-valuetext={`${Math.round(value * 10) / 10} ${unit}`}
                style={{ "--fill": `${fill}%` } as CSSProperties}
                onChange={event => onChange(Number(event.target.value))}
            />

            {children}

        </div>
    );
}
