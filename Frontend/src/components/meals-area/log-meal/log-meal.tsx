import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { MealsFormValues } from "../../../models/meal-model";
import { foodService } from "../../../services/food-service";
import { mealService } from "../../../services/meal-service";
import { mealUtil } from "../../../utils/meal-util";
import { notify } from "../../../utils/notify";
import { MealItem } from "../meal-item/meal-item";
import "./log-meal.css";

type PromptFormValues = {
    prompt: string;
};

export function LogMeal() {

    const promptForm = useForm<PromptFormValues>();
    const mealsForm = useForm<MealsFormValues>({ defaultValues: { meals: [mealUtil.emptyDraft()] } });
    const { fields, append, remove, replace } = useFieldArray({ control: mealsForm.control, name: "meals" });

    const isEstimating = promptForm.formState.isSubmitting;
    const isLogging = mealsForm.formState.isSubmitting;

    // Send the description to the AI, and fill the form with what comes back (one row per food):
    async function estimate({ prompt }: PromptFormValues): Promise<void> {
        try {
            const foods = await foodService.getAiEstimate(prompt.trim());
            if (foods.length === 0) {
                notify.error("No foods were found in that description, try rephrasing it.");
                return;
            }
            replace(foods.map(food => mealUtil.fromEstimate(food)));
            mealsForm.clearErrors();
        }
        catch (err: any) {
            notify.error(err);
        }
    }

    // Log every row as its own meal log:
    async function logMeals({ meals }: MealsFormValues): Promise<void> {
        const loggedIndexes: number[] = [];
        try {
            for (let i = 0; i < meals.length; i++) {
                await mealService.addMeal(mealUtil.toMeal(meals[i]));
                loggedIndexes.push(i);
            }
            notify.success(meals.length === 1 ? "Meal logged." : `${meals.length} meals logged.`);
            mealsForm.reset({ meals: [mealUtil.emptyDraft()] });
            promptForm.reset();
        }
        catch (err: any) {
            notify.error(err);
            // Keep only the rows that weren't logged, so they can be fixed and sent again:
            if (loggedIndexes.length > 0) remove(loggedIndexes);
        }
    }

    return (
        <section className="LogMeal card">

            <h3>Log a meal</h3>

            <form className="ai-form" onSubmit={promptForm.handleSubmit(estimate)} noValidate>

                <label htmlFor="prompt">Describe what you ate</label>
                <textarea
                    id="prompt"
                    rows={3}
                    dir="auto"
                    placeholder="e.g. 200 grams potato and 300 grams of beef"
                    aria-invalid={!!promptForm.formState.errors.prompt}
                    {...promptForm.register("prompt", {
                        validate: value => value.trim().length > 0 || "Describe your meal first."
                    })}
                />
                {promptForm.formState.errors.prompt && (
                    <span className="field-error">{promptForm.formState.errors.prompt.message}</span>
                )}

                <button type="submit" className="btn-secondary" disabled={isEstimating || isLogging}>
                    {isEstimating ? "Estimating..." : "Get AI estimate"}
                </button>

            </form>

            <p className="divider">Check the details below, or search a food by name to fill them in</p>

            <FormProvider {...mealsForm}>
                <form onSubmit={mealsForm.handleSubmit(logMeals)} noValidate>

                    {fields.map((field, index) => (
                        <MealItem
                            key={field.id}
                            index={index}
                            canRemove={fields.length > 1}
                            onRemove={() => remove(index)}
                            disabled={isLogging}
                        />
                    ))}

                    <div className="actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => append(mealUtil.emptyDraft())}
                            disabled={isLogging}
                        >
                            + Add item
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLogging || isEstimating}>
                            {isLogging ? "Logging..." : "Log meal"}
                        </button>
                    </div>

                </form>
            </FormProvider>

        </section>
    );
}
