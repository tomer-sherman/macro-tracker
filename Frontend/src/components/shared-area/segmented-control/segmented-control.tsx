import { useId } from "react";
import "./segmented-control.css";

type SegmentOption<T extends string> = {
    value: T;
    label: string;     // Shown, e.g. "1M".
    fullLabel: string; // Read by screen readers, e.g. "1 month".
};

type SegmentedControlProps<T extends string> = {
    label: string; // Names the group, e.g. "Range".
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
};

// A row of mutually exclusive choices - native radios, so arrow keys and screen readers work as usual:
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {

    const name = useId();

    return (
        <fieldset className="SegmentedControl">

            <legend className="visually-hidden">{label}</legend>

            {options.map(option => (
                <label key={option.value} className={option.value === value ? "selected" : undefined}>
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={option.value === value}
                        onChange={() => onChange(option.value)}
                    />
                    <span aria-hidden="true">{option.label}</span>
                    <span className="visually-hidden">{option.fullLabel}</span>
                </label>
            ))}

        </fieldset>
    );
}
