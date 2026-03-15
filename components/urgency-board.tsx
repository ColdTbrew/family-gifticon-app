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

const columnClassName =
  "rounded-[1.25rem] border border-line bg-white p-4 shadow-panel";
const emptyClassName = "m-0 text-sm text-muted";

export function UrgencyBoard({ buckets }: UrgencyBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className={columnClassName}>
        <h2 className="m-0 text-base font-semibold text-ink">오늘 만료</h2>
        <span className="mb-3 mt-2 inline-flex rounded-full bg-danger px-2.5 py-1 text-xs font-semibold text-white">
          D-0
        </span>
        <div className="flex flex-col gap-2.5">
          {buckets.today.length > 0 ? (
            buckets.today.map((entry) => (
              <GifticonCard key={entry.item.id} item={entry.item} ddayLabel={renderDdayLabel(entry.daysLeft)} />
            ))
          ) : (
            <p className={emptyClassName}>오늘 만료되는 쿠폰이 없습니다.</p>
          )}
        </div>
      </section>

      <section className={columnClassName}>
        <h2 className="m-0 text-base font-semibold text-ink">곧 만료</h2>
        <span className="mb-3 mt-2 inline-flex rounded-full bg-caution px-2.5 py-1 text-xs font-semibold text-white">
          D-1 ~ D-3
        </span>
        <div className="flex flex-col gap-2.5">
          {buckets.soon.length > 0 ? (
            buckets.soon.map((entry) => (
              <GifticonCard key={entry.item.id} item={entry.item} ddayLabel={renderDdayLabel(entry.daysLeft)} />
            ))
          ) : (
            <p className={emptyClassName}>D-3 이내 쿠폰이 없습니다.</p>
          )}
        </div>
      </section>

      <section className={columnClassName}>
        <h2 className="m-0 text-base font-semibold text-ink">주의</h2>
        <span className="mb-3 mt-2 inline-flex rounded-full bg-[#ffe2b7] px-2.5 py-1 text-xs font-semibold text-[#593000]">
          D-4 ~ D-7
        </span>
        <div className="flex flex-col gap-2.5">
          {buckets.caution.length > 0 ? (
            buckets.caution.map((entry) => (
              <GifticonCard key={entry.item.id} item={entry.item} ddayLabel={renderDdayLabel(entry.daysLeft)} />
            ))
          ) : (
            <p className={emptyClassName}>D-7 이내 쿠폰이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
