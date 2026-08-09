import { ExpiryCalendar, type ExpiryCalendarDay } from "@/components/expiry-calendar";
import { PageState } from "@/components/page-state";
import { daysUntil, parseDateOnly, toDateInputValue } from "@/lib/date";
import { fetchCurrentUserGifticons } from "@/lib/data/gifticons";
import type { Gifticon } from "@/lib/types";

function getCurrentMonthDays(reference: Date): Date[] {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];

  for (let day = first.getDate(); day <= last.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  return days;
}

function groupByExpiryDate(gifticons: Gifticon[]): Map<string, Gifticon[]> {
  const grouped = new Map<string, Gifticon[]>();

  gifticons.forEach((item) => {
    if (item.status !== "available") {
      return;
    }
    const key = toDateInputValue(parseDateOnly(item.expiresAt));
    const current = grouped.get(key) ?? [];
    current.push(item);
    grouped.set(key, current);
  });

  return grouped;
}

function getMonthReference(value: string | undefined, fallback: Date): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (!match) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), 1);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 2000 || year > 2100 || month < 1 || month > 12) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), 1);
  }

  return new Date(year, month - 1, 1);
}

function getMonthHref(reference: Date, offset: number): string {
  const target = new Date(reference.getFullYear(), reference.getMonth() + offset, 1);
  const monthKey = toDateInputValue(target).slice(0, 7);
  return `/calendar?month=${monthKey}`;
}

function getDdayLabel(expiresAt: string, today: Date): string {
  const remainingDays = daysUntil(expiresAt, today);
  if (remainingDays === 0) {
    return "D-day";
  }
  return remainingDays > 0 ? `D-${remainingDays}` : `D+${Math.abs(remainingDays)}`;
}

export const dynamic = "force-dynamic";

type CalendarPageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { month } = await searchParams;
  const { gifticons, isAuthenticated, errorMessage } = await fetchCurrentUserGifticons();
  const today = new Date();
  const reference = getMonthReference(month, today);
  const days = getCurrentMonthDays(reference);
  const byDate = groupByExpiryDate(gifticons);
  const calendarDays: ExpiryCalendarDay[] = days.map((day) => {
    const key = toDateInputValue(day);
    return {
      key,
      day: day.getDate(),
      items: (byDate.get(key) ?? []).map((item) => ({
        item,
        ddayLabel: getDdayLabel(item.expiresAt, today)
      }))
    };
  });
  const monthLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long"
  }).format(reference);

  return (
    <section className="flex flex-col gap-6">
      <header className="mb-5 flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-brand">날짜별 확인</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">만료 캘린더</h1>
        <p className="text-base text-muted-foreground">
          월간 뷰에서 날짜를 보고, 각 날짜에 끝나는 기프티콘 개수를 바로 확인합니다.
        </p>
      </header>

      {errorMessage ? (
        <PageState
          variant="error"
          title="캘린더 데이터를 불러오지 못했습니다."
          description={errorMessage}
        />
      ) : !isAuthenticated ? (
        <PageState
          title="로그인이 필요합니다."
          description="캘린더를 보려면 먼저 Google 로그인 해주세요."
          action={{ href: "/auth", label: "로그인하러 가기" }}
        />
      ) : (
        <ExpiryCalendar
          key={toDateInputValue(reference).slice(0, 7)}
          days={calendarDays}
          firstWeekday={days[0]?.getDay() ?? 0}
          monthLabel={monthLabel}
          previousMonthHref={getMonthHref(reference, -1)}
          nextMonthHref={getMonthHref(reference, 1)}
          todayKey={toDateInputValue(today)}
        />
      )}
    </section>
  );
}
