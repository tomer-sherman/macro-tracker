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

    // The same day of the month, a few months away - clamped to that month's length (Mar 31 - 1 month = Feb 28):
    public shiftMonths(dateKey: string, months: number): string {
        const month = this.addMonths(this.toMonthKey(dateKey), months);
        const [year, monthNumber] = month.split("-").map(Number);
        const daysInMonth = new Date(year, monthNumber, 0).getDate();
        const day = Math.min(Number(dateKey.slice(8)), daysInMonth);
        return `${month}-${String(day).padStart(2, "0")}`;
    }

    // Whole days from one date to another (Nov 10 -> Nov 16 = 6). Rounded, so a daylight-saving change doesn't matter:
    public daysBetween(from: string, to: string): number {
        const msPerDay = 24 * 60 * 60 * 1000;
        return Math.round((this.fromDateKey(to).getTime() - this.fromDateKey(from).getTime()) / msPerDay);
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
