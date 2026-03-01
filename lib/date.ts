function toLocalStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDateOnly(value: string): Date {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (matched) {
    const [, year, month, day] = matched;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(value);
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysUntil(expiresAt: string, now: Date): number {
  const target = toLocalStartOfDay(parseDateOnly(expiresAt));
  const base = toLocalStartOfDay(now);
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.floor((target.getTime() - base.getTime()) / oneDayMs);
}
