import { useFormContext, useWatch } from "react-hook-form";
import { MealsFormValues } from "../../../models/meal-model";
import { MacroChip } from "../../shared-area/macro-chip/macro-chip";
import { RangeSlider } from "../../shared-area/range-slider/range-slider";
import "./grams-slider.css";

type GramsSliderProps = {
    index: number;              // The row in the meals form.
    disabled: boolean;
    onWeightChange: () => void; // Runs after the weight is set (MealItem's rescale).
};

const SLIDER_MIN = 5;
const SLIDER_MAX = 1000;
const SLIDER_STEP = 5;

// Drag to set a row's weight - with a live readout of the weight and the recalculated macros.
// It writes the same `grams` field as the Weight input, so the two always agree:
export function GramsSlider({ index, disabled, onWeightChange }: GramsSliderProps) {

    const { control, setValue, formState: { isSubmitted } } = useFormContext<MealsFormValues>();
    const [grams, calories, protien, carbs, fats] = useWatch({
        control,
        name: [
            `meals.${index}.grams`,
            `meals.${index}.calories`,
            `meals.${index}.protien`,
            `meals.${index}.carbs`,
            `meals.${index}.fats`
        ]
    });

    const weight = grams ?? 0;
    // A weight typed above the range stretches the range instead of being clamped:
    const max = Math.max(SLIDER_MAX, Math.ceil(weight / 100) * 100);

    function change(value: number): void {
        setValue(`meals.${index}.grams`, value, { shouldValidate: isSubmitted, shouldDirty: true });
        onWeightChange();
    }

    return (
        <div className="GramsSlider">
            <RangeSlider
                id={`meal-${index}-grams-slider`}
                label="Adjust weight"
                value={weight}
                min={SLIDER_MIN}
                max={max}
                step={SLIDER_STEP}
                unit="g"
                disabled={disabled}
                onChange={change}
            >
                <dl className="live-macros" aria-label="Macros for this weight">
                    <MacroChip label="Calories" value={calories} unit="kcal" tone="calories" />
                    <MacroChip label="Protein" value={protien} unit="g" tone="protein" />
                    <MacroChip label="Carbs" value={carbs} unit="g" tone="carbs" />
                    <MacroChip label="Fat" value={fats} unit="g" tone="fat" />
                </dl>
            </RangeSlider>
        </div>
    );
}
