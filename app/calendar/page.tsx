import Link from "next/link";
import { parseDateOnly, toDateInputValue } from "@/lib/date";
import { fetchCurrentUserGifticons } from "@/lib/data/gifticons";
import { Gifticon } from "@/lib/types";

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

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { gifticons, isAuthenticated, errorMessage } = await fetchCurrentUserGifticons();
  const today = new Date();
  const days = getCurrentMonthDays(today);
  const byDate = groupByExpiryDate(gifticons);
  const totalVisible = Array.from(byDate.values()).reduce((sum, items) => sum + items.length, 0);

  return (
    <section className="space-y-6">
      <header className="mb-5 space-y-1.5">
        <p className="text-sm font-semibold text-brand">날짜별 확인</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">만료 캘린더</h1>
        <p className="text-base text-muted">
          월간 뷰에서 날짜를 보고, 각 날짜에 끝나는 기프티콘 개수를 바로 확인합니다.
        </p>
      </header>

      {errorMessage ? (
        <div className="max-w-xl rounded-3xl border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">캘린더 데이터를 불러오지 못했습니다.</p>
          <p className="text-base text-muted">{errorMessage}</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="max-w-xl rounded-3xl border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">로그인이 필요합니다.</p>
          <p className="text-base text-muted">캘린더를 보려면 먼저 Google 로그인 해주세요.</p>
          <Link
            className="mt-4 inline-flex rounded-xl border border-[#2f5ec4] px-3 py-2 font-semibold text-[#2f5ec4] transition hover:bg-[#f1f6ff]"
            href="/auth"
          >
            로그인하러 가기
          </Link>
        </div>
      ) : totalVisible === 0 ? (
        <div className="max-w-xl rounded-3xl border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">표시할 만료 일정이 없습니다.</p>
          <p className="text-base text-muted">사용 가능한 기프티콘을 등록하면 날짜별로 표시됩니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day) => {
            const key = toDateInputValue(day);
            const items = byDate.get(key) ?? [];
            return (
              <article key={key} className="min-h-[90px] rounded-2xl border border-line bg-white p-3 shadow-sm lg:min-h-[110px]">
                <strong className="text-sm font-bold text-ink">{day.getDate()}</strong>
                <span className="mb-2 mt-1 block text-xs text-muted">{items.length}개</span>
                {items.slice(0, 2).map((item) => (
                  <span key={item.id} className="mb-1 block text-xs text-ink">
                    {item.title}
                  </span>
                ))}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
