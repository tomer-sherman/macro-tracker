import { mealUtil } from "../../../utils/meal-util";
import "./macro-chip.css";

// A stat's signal color. Fixed - a macro keeps its tone everywhere it appears (fiber, sugars etc. are "neutral"):
export type MacroTone = "calories" | "protein" | "carbs" | "fat" | "neutral";

type MacroChipProps = {
    label: string;
    value: number | null | undefined; // null / undefined shows "—" with no unit.
    unit: string;
    tone: MacroTone;
};

// One stat as a chip in its macro's color - label + mono value.
// Renders a <dt>/<dd> pair, so it must sit inside a <dl>:
export function MacroChip({ label, value, unit, tone }: MacroChipProps) {

    const hasValue = value !== null && value !== undefined;

    return (
        <div className={`MacroChip tone-${tone}`}>
            <dt>{label}</dt>
            <dd>
                <span className="num">{mealUtil.format(value)}</span>
                {hasValue && <span className="unit"> {unit}</span>}
            </dd>
        </div>
    );
}
