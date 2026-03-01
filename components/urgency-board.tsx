import { GifticonCard } from "@/components/gifticon-card";
import { UrgencyBuckets } from "@/lib/urgency";

type UrgencyBoardProps = {
  buckets: UrgencyBuckets;
};

function renderDdayLabel(daysLeft: number): string {
  if (daysLeft === 0) {
    return "D-day";
  }
  return `D-${daysLeft}`;
}

export function UrgencyBoard({ buckets }: UrgencyBoardProps) {
  return (
    <div className="urgency-grid">
      <section className="urgency-column">
        <h2>오늘 만료</h2>
        <span className="tag today">D-0</span>
        <div className="card-list">
          {buckets.today.length > 0 ? (
            buckets.today.map((entry) => (
              <GifticonCard key={entry.item.id} item={entry.item} ddayLabel={renderDdayLabel(entry.daysLeft)} />
            ))
          ) : (
            <p className="empty">오늘 만료되는 쿠폰이 없습니다.</p>
          )}
        </div>
      </section>

      <section className="urgency-column">
        <h2>곧 만료</h2>
        <span className="tag soon">D-1 ~ D-3</span>
        <div className="card-list">
          {buckets.soon.length > 0 ? (
            buckets.soon.map((entry) => (
              <GifticonCard key={entry.item.id} item={entry.item} ddayLabel={renderDdayLabel(entry.daysLeft)} />
            ))
          ) : (
            <p className="empty">D-3 이내 쿠폰이 없습니다.</p>
          )}
        </div>
      </section>

      <section className="urgency-column">
        <h2>주의</h2>
        <span className="tag caution">D-4 ~ D-7</span>
        <div className="card-list">
          {buckets.caution.length > 0 ? (
            buckets.caution.map((entry) => (
              <GifticonCard key={entry.item.id} item={entry.item} ddayLabel={renderDdayLabel(entry.daysLeft)} />
            ))
          ) : (
            <p className="empty">D-7 이내 쿠폰이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
