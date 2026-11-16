// Dates are passed around as local "YYYY-MM-DD" keys (what the backend expects) and months as "YYYY-MM".
// Keys compare correctly as plain strings, e.g. "2026-11-09" < "2026-11-10".
class DateUtil {

    // The browser's IANA time zone, e.g. "Asia/Jerusalem":
    public timeZone(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // A local Date as YYYY-MM-DD:
    public toDateKey(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${date.getFullYear()}-${month}-${day}`;
    }

    // Today's local date as YYYY-MM-DD:
    public todayKey(): string {
        return this.toDateKey(new Date());
    }

    // YYYY-MM-DD -> a local Date at midnight (new Date("YYYY-MM-DD") would parse it as UTC):
    public fromDateKey(dateKey: string): Date {
        const [year, month, day] = dateKey.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    // Is it a real YYYY-MM-DD date? ("2026-02-30" is not):
    public isDateKey(value: string): boolean {
        return /^\d{4}-\d{2}-\d{2}$/.test(value) && this.toDateKey(this.fromDateKey(value)) === value;
    }

    public addDays(dateKey: string, days: number): string {
        const date = this.fromDateKey(dateKey);
        date.setDate(date.getDate() + days);
        return this.toDateKey(date);
    }

    // YYYY-MM-DD -> YYYY-MM:
    public toMonthKey(dateKey: string): string {
        return dateKey.slice(0, 7);
    }

    public addMonths(monthKey: string, months: number): string {
        const [year, month] = monthKey.split("-").map(Number);
        return this.toMonthKey(this.toDateKey(new Date(year, month - 1 + months, 1)));
    }

    // e.g. "Monday, November 10, 2026":
    public toLongDate(dateKey: string): string {
        return this.fromDateKey(dateKey).toLocaleDateString(undefined, {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
    }

    // Only the time of day (no date), e.g. "14:05":
    public toTime(isoDate: string): string {
        return new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

}

export const dateUtil = new DateUtil();
