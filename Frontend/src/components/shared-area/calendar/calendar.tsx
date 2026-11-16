import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { dateUtil } from "../../../utils/date-util";
import "./calendar.css";

type CalendarProps = {
    month: string;          // The month on display, YYYY-MM.
    selected: string;       // The selected date, YYYY-MM-DD.
    max: string;            // The last selectable date, YYYY-MM-DD - later days are disabled.
    marked?: Set<string>;   // Dates that get a dot.
    markedLabel?: string;   // What a dot means, e.g. "Logged meals".
    isBusy?: boolean;       // The marks are still loading.
    onSelect: (date: string) => void;
    onMonthChange: (month: string) => void;
};

// Short weekday names in the browser's language, Sunday first. 1 Jan 2023 was a Sunday:
const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2023, 0, 1 + i).toLocaleDateString(undefined, { weekday: "short" })
);

// The same day of the month, a few months away (Jan 31 + 1 month = Feb 28):
function shiftMonths(date: string, months: number): string {
    const month = dateUtil.addMonths(dateUtil.toMonthKey(date), months);
    const [year, monthNumber] = month.split("-").map(Number);
    const daysInMonth = new Date(year, monthNumber, 0).getDate();
    const day = Math.min(Number(date.slice(8)), daysInMonth);
    return `${month}-${String(day).padStart(2, "0")}`;
}

export function Calendar({ month, selected, max, marked, markedLabel = "Marked", isBusy, onSelect, onMonthChange }: CalendarProps) {

    const daysRef = useRef<HTMLDivElement>(null);
    const [focusDate, setFocusDate] = useState<string | null>(null); // The last day clicked or moved to with the keyboard.
    const shouldFocus = useRef(false);

    const today = dateUtil.todayKey();
    const maxMonth = dateUtil.toMonthKey(max);

    const [year, monthNumber] = month.split("-").map(Number);
    const firstWeekday = new Date(year, monthNumber - 1, 1).getDay(); // 0 = Sunday.
    const daysInMonth = new Date(year, monthNumber, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
    const title = new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

    // Only one day is in the tab order, the arrow keys move between days (the usual date-picker behavior):
    const isFocusable = (date: string | null): date is string => date !== null && dateUtil.toMonthKey(date) === month && date <= max;
    const tabStop = [focusDate, selected, max].find(isFocusable) ?? days[0];

    // After a keyboard move has rendered (it may have switched the month), focus the new day:
    useEffect(() => {
        if (!shouldFocus.current || !focusDate) return;
        shouldFocus.current = false;
        daysRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus();
    }, [focusDate, month]);

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: string): void {
        const weekday = dateUtil.fromDateKey(date).getDay();
        let target: string;

        switch (event.key) {
            case "ArrowLeft": target = dateUtil.addDays(date, -1); break;
            case "ArrowRight": target = dateUtil.addDays(date, 1); break;
            case "ArrowUp": target = dateUtil.addDays(date, -7); break;
            case "ArrowDown": target = dateUtil.addDays(date, 7); break;
            case "Home": target = dateUtil.addDays(date, -weekday); break;    // Start of the week.
            case "End": target = dateUtil.addDays(date, 6 - weekday); break;  // End of the week.
            case "PageUp": target = shiftMonths(date, -1); break;
            case "PageDown": target = shiftMonths(date, 1); break;
            default: return;
        }

        event.preventDefault();
        if (target > max) target = max; // Never onto a disabled (future) day.
        if (target === date) return;

        const targetMonth = dateUtil.toMonthKey(target);
        if (targetMonth !== month) onMonthChange(targetMonth);

        shouldFocus.current = true;
        setFocusDate(target);
    }

    function selectDay(date: string): void {
        setFocusDate(date);
        onSelect(date);
    }

    function goToToday(): void {
        onMonthChange(dateUtil.toMonthKey(today));
        selectDay(today);
    }

    return (
        <div className="Calendar">

            <div className="calendar-header">
                <button
                    type="button"
                    className="nav-btn"
                    aria-label="Previous month"
                    onClick={() => onMonthChange(dateUtil.addMonths(month, -1))}
                >
                    ‹
                </button>

                <h3 aria-live="polite">{title}</h3>

                <button
                    type="button"
                    className="nav-btn"
                    aria-label="Next month"
                    disabled={month >= maxMonth}
                    onClick={() => onMonthChange(dateUtil.addMonths(month, 1))}
                >
                    ›
                </button>
            </div>

            <div className="weekdays" aria-hidden="true">
                {weekdays.map(weekday => <span key={weekday}>{weekday}</span>)}
            </div>

            <div className="days" ref={daysRef} role="group" aria-label={title} aria-busy={isBusy}>
                {days.map((date, index) => {
                    const isMarked = marked?.has(date) ?? false;
                    const classes = ["day"];
                    if (date === selected) classes.push("selected");
                    if (date === today) classes.push("today");

                    return (
                        <button
                            key={date}
                            type="button"
                            data-date={date}
                            className={classes.join(" ")}
                            // The 1st sits under its weekday, the rest of the days flow after it:
                            style={index === 0 ? { gridColumnStart: firstWeekday + 1 } : undefined}
                            tabIndex={date === tabStop ? 0 : -1}
                            disabled={date > max}
                            aria-pressed={date === selected}
                            aria-current={date === today ? "date" : undefined}
                            aria-label={dateUtil.toLongDate(date) + (isMarked ? ` (${markedLabel})` : "")}
                            onClick={() => selectDay(date)}
                            onKeyDown={event => handleKeyDown(event, date)}
                        >
                            {index + 1}
                            {isMarked && <span className="dot" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>

            <div className="calendar-footer">
                <span className="legend">
                    <span className="dot" aria-hidden="true" />
                    {isBusy ? "Loading..." : markedLabel}
                </span>

                <button
                    type="button"
                    className="btn-secondary today-btn"
                    onClick={goToToday}
                    disabled={today > max || (selected === today && month === dateUtil.toMonthKey(today))}
                >
                    Today
                </button>
            </div>

        </div>
    );
}
