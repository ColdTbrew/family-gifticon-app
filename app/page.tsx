import { UrgencyBoard } from "@/components/urgency-board";
import { mockGifticons } from "@/lib/mock-data";
import { buildUrgencyBuckets } from "@/lib/urgency";

export default function HomePage() {
  const urgency = buildUrgencyBuckets(mockGifticons, new Date());

  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">만료 임박 우선</p>
        <h1>가족 기프티콘 홈</h1>
        <p className="muted">
          먼저 써야 하는 쿠폰부터 보여줍니다. 기본 정렬은 만료일 오름차순입니다.
        </p>
      </header>

      <UrgencyBoard buckets={urgency} />
    </section>
  );
}
