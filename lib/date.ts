function toLocalStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
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
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

export function formatKoreanDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const isAfternoon = date.getHours() >= 12;
  const hour12 = date.getHours() % 12 || 12;
  const minute = pad2(date.getMinutes());
  return `${year}. ${month}. ${day}. ${isAfternoon ? "오후" : "오전"} ${hour12}:${minute}`;
}

export function daysUntil(expiresAt: string, now: Date): number {
  const target = toLocalStartOfDay(parseDateOnly(expiresAt));
  const base = toLocalStartOfDay(now);
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.floor((target.getTime() - base.getTime()) / oneDayMs);
}
