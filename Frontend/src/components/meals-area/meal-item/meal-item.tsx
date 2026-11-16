import axios from "axios";
import { KeyboardEvent, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { MealsFormValues, MealStats } from "../../../models/meal-model";
import { foodService } from "../../../services/food-service";
import { mealUtil } from "../../../utils/meal-util";
import { notify } from "../../../utils/notify";
import { GramsSlider } from "../grams-slider/grams-slider";
import "./meal-item.css";

type NumberField = {
    name: "grams" | keyof MealStats;
    label: string;
    unit: string;
    required: boolean;
    min: number;
    max?: number;
};

// Same rules as the backend meal-log model, so a value the backend would reject is caught before sending:
const numberFields: NumberField[] = [
    { name: "grams", label: "Weight", unit: "g", required: true, min: 0.1 },
    { name: "calories", label: "Calories", unit: "kcal", required: true, min: 0, max: 8000 },
    { name: "protien", label: "Protein", unit: "g", required: true, min: 0, max: 8000 },
    { name: "carbs", label: "Carbs", unit: "g", required: true, min: 0, max: 8000 },
    { name: "fats", label: "Fat", unit: "g", required: true, min: 0, max: 8000 },
    { name: "fiber", label: "Fiber", unit: "g", required: false, min: 0, max: 100 },
    { name: "sugars", label: "Sugars", unit: "g", required: false, min: 0, max: 100 }
];

const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAY_MS = 300;
const HEBREW_HINT = "Hebrew names can't be looked up yet - search in English to fill the stats.";

// Empty number input -> null, otherwise a number:
function toNullableNumber(value: unknown): number | null {
    if (value === "" || value === null || value === undefined) return null;
    return Number(value);
}

function rulesFor(field: NumberField) {
    return {
        setValueAs: toNullableNumber,
        required: field.required ? "Required" : false,
        min: { value: field.min, message: `Must be at least ${field.min}` },
        max: field.max === undefined ? undefined : { value: field.max, message: `Cannot be above ${field.max}` }
    };
}

// Mirrors the backend's desc setter (trim + collapse spaces) and its 5-300 length rule:
function validateDesc(value: string): string | true {
    const length = value.trim().replace(/[ \t]+/g, " ").length;
    if (length === 0) return "Description is required.";
    if (length < 5) return "Must be at least 5 characters.";
    if (length > 300) return "Cannot be more than 300 characters.";
    return true;
}

type MealItemProps = {
    index: number;
    canRemove: boolean;
    onRemove: () => void;
    disabled: boolean;
};

export function MealItem({ index, canRemove, onRemove, disabled }: MealItemProps) {

    const { register, setValue, getValues, control, formState: { errors, isSubmitted } } = useFormContext<MealsFormValues>();
    const per100 = useWatch({ control, name: `meals.${index}.per100` });
    const rowErrors = errors.meals?.[index];

    // Food search state:
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<string[]>([]);
    const [hint, setHint] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isFilling, setIsFilling] = useState(false);

    const descId = `meal-${index}-desc`;
    const listId = `${descId}-list`;

    // Search the food database a moment after the user stops typing. A newer keystroke cancels the older search:
    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < MIN_QUERY_LENGTH) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const found = await foodService.searchFood(trimmed, controller.signal);
                // Only English names can be looked up by /api/food-by-desc:
                const names = [...new Set(found.map(food => food.nameEn).filter((name): name is string => !!name))];
                setResults(names);
                setHint(names.length > 0 ? null : found.length > 0 ? HEBREW_HINT : "No foods found.");
                setActiveIndex(-1);
                setIsSearching(false);
            }
            catch (err: any) {
                if (axios.isCancel(err)) return;
                setIsSearching(false);
                notify.error(err);
            }
        }, SEARCH_DELAY_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    function handleDescTyping(value: string): void {
        setQuery(value);
        setActiveIndex(-1);
        if (value.trim().length >= MIN_QUERY_LENGTH) {
            setIsSearching(true);
            setIsOpen(true);
        }
        else {
            setIsSearching(false);
            setIsOpen(false);
            setResults([]);
            setHint(null);
        }
    }

    function applyStats(stats: MealStats): void {
        for (const key of mealUtil.statKeys) {
            setValue(`meals.${index}.${key}`, stats[key], { shouldValidate: isSubmitted });
        }
    }

    // A food was picked - fetch its stats (per 100 g) and scale them to the row's weight (100 g by default):
    async function pick(nameEn: string): Promise<void> {
        setIsOpen(false);
        setResults([]);
        setQuery("");
        setValue(`meals.${index}.desc`, nameEn, { shouldValidate: isSubmitted });

        setIsFilling(true);
        try {
            const food = await foodService.getFoodByDesc(nameEn);
            const foodPer100 = mealUtil.statsFromFood(food);

            const currentGrams = getValues(`meals.${index}.grams`);
            const grams = currentGrams !== null && currentGrams > 0 ? currentGrams : 100;

            setValue(`meals.${index}.grams`, grams, { shouldValidate: isSubmitted });
            setValue(`meals.${index}.per100`, foodPer100);
            applyStats(mealUtil.scale(foodPer100, grams));
        }
        catch (err: any) {
            notify.error(err);
        }
        finally {
            setIsFilling(false);
        }
    }

    // Weight changed - rescale the stats if they came from the database / AI:
    function rescale(): void {
        const base = getValues(`meals.${index}.per100`);
        const grams = getValues(`meals.${index}.grams`);
        if (!base || grams === null || !(grams > 0)) return;
        applyStats(mealUtil.scale(base, grams));
    }

    // A stat was edited by hand - stop auto-scaling this row, so the weight won't overwrite the edit:
    function detachFromFood(): void {
        if (getValues(`meals.${index}.per100`)) setValue(`meals.${index}.per100`, null);
    }

    function handleDescKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        if (!isOpen) return;

        if (event.key === "Escape") {
            setIsOpen(false);
            return;
        }
        if (results.length === 0) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex(i => (i + 1) % results.length);
        }
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex(i => (i <= 0 ? results.length - 1 : i - 1));
        }
        else if (event.key === "Enter") {
            // Don't submit the form while choosing a food:
            event.preventDefault();
            if (activeIndex >= 0) pick(results[activeIndex]);
        }
    }

    const showList = isOpen && results.length > 0;
    const showStatus = isOpen && !showList && (isSearching || !!hint);

    return (
        <div className="MealItem">

            <div className="item-header">
                <span className="item-title">Item {index + 1}</span>
                {canRemove && (
                    <button
                        type="button"
                        className="btn-remove"
                        aria-label={`Remove item ${index + 1}`}
                        onClick={onRemove}
                        disabled={disabled}
                    >
                        Remove
                    </button>
                )}
            </div>

            <div className="field">
                <label htmlFor={descId}>
                    Description
                    {isFilling && <span className="filling">Loading stats...</span>}
                </label>

                <div className="combo">
                    <input
                        id={descId}
                        type="text"
                        dir="auto"
                        placeholder="Search a food in English, e.g. chicken breast"
                        autoComplete="off"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={showList}
                        aria-controls={listId}
                        aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                        aria-invalid={!!rowErrors?.desc}
                        onKeyDown={handleDescKeyDown}
                        onFocus={() => { if (results.length > 0 || hint) setIsOpen(true); }}
                        {...register(`meals.${index}.desc`, {
                            validate: validateDesc,
                            onChange: event => handleDescTyping(event.target.value),
                            onBlur: () => setIsOpen(false)
                        })}
                    />

                    {showList && (
                        <ul id={listId} role="listbox" className="suggestions">
                            {results.map((name, i) => (
                                <li
                                    key={name}
                                    id={`${listId}-${i}`}
                                    role="option"
                                    aria-selected={i === activeIndex}
                                    className={i === activeIndex ? "active" : undefined}
                                    dir="auto"
                                    // Keep focus on the input, so its blur doesn't close the list before the click lands:
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => pick(name)}
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    )}

                    {showStatus && (
                        <p className="suggestions status" aria-busy={isSearching}>{isSearching ? "Searching..." : hint}</p>
                    )}
                </div>

                {rowErrors?.desc && <span className="field-error">{rowErrors.desc.message}</span>}
            </div>

            <GramsSlider index={index} disabled={disabled} onWeightChange={rescale} />

            <div className="number-grid">
                {numberFields.map(numberField => {
                    const id = `meal-${index}-${numberField.name}`;
                    const error = rowErrors?.[numberField.name];
                    return (
                        <div className="field" key={numberField.name} data-field={numberField.name}>
                            <label htmlFor={id}>
                                {numberField.label} <span className="unit">{numberField.unit}</span>
                                {!numberField.required && <span className="optional">optional</span>}
                            </label>
                            <input
                                id={id}
                                type="number"
                                step="any"
                                inputMode="decimal"
                                aria-invalid={!!error}
                                {...register(`meals.${index}.${numberField.name}`, {
                                    ...rulesFor(numberField),
                                    onChange: numberField.name === "grams" ? rescale : detachFromFood
                                })}
                            />
                            {error && <span className="field-error">{error.message}</span>}
                        </div>
                    );
                })}
            </div>

            {per100 && (
                <p className="scale-hint">Stats are worked out per 100 g and update when you change the weight.</p>
            )}

        </div>
    );
}
