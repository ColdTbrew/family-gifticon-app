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
    <section>
      <header className="page-header">
        <p className="eyebrow">날짜별 확인</p>
        <h1>만료 캘린더</h1>
        <p className="muted">
          월간 뷰에서 날짜를 보고, 각 날짜에 끝나는 기프티콘 개수를 바로 확인합니다.
        </p>
      </header>

      {!isAuthenticated ? (
        <div className="notice-card">
          <p className="notice-title">로그인이 필요합니다.</p>
          <p className="muted">캘린더를 보려면 먼저 Google 로그인 해주세요.</p>
          <Link className="action-link" href="/auth">
            로그인하러 가기
          </Link>
        </div>
      ) : errorMessage ? (
        <div className="notice-card">
          <p className="notice-title">캘린더 데이터를 불러오지 못했습니다.</p>
          <p className="muted">{errorMessage}</p>
        </div>
      ) : totalVisible === 0 ? (
        <div className="notice-card">
          <p className="notice-title">표시할 만료 일정이 없습니다.</p>
          <p className="muted">사용 가능한 기프티콘을 등록하면 날짜별로 표시됩니다.</p>
        </div>
      ) : (
        <div className="calendar-grid">
          {days.map((day) => {
            const key = toDateInputValue(day);
            const items = byDate.get(key) ?? [];
            return (
              <article key={key} className="calendar-cell">
                <strong>{day.getDate()}</strong>
                <span className="calendar-count">{items.length}개</span>
                {items.slice(0, 2).map((item) => (
                  <span key={item.id} className="calendar-item">
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
