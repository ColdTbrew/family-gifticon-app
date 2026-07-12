import Link from "next/link";
import { redirect } from "next/navigation";
import { daysUntil } from "@/lib/date";
import { GifticonCard } from "@/components/gifticon-card";
import { PushNotificationControl } from "@/components/push-notification-control";
import { UrgencyBoard } from "@/components/urgency-board";
import { fetchCurrentUserGifticons } from "@/lib/data/gifticons";
import { buildUrgencyBuckets } from "@/lib/urgency";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Promise<{
    code?: string | string[];
    next?: string | string[];
  }>;
};

function toSingleParam(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const oauthCode = toSingleParam(resolvedSearchParams?.code);
  const next = toSingleParam(resolvedSearchParams?.next);

  if (oauthCode) {
    const callbackUrl = new URL("http://localhost/auth/callback");
    callbackUrl.searchParams.set("code", oauthCode);
    if (next) {
      callbackUrl.searchParams.set("next", next);
    }
    redirect(`${callbackUrl.pathname}${callbackUrl.search}`);
  }

  const { gifticons, isAuthenticated, errorMessage } = await fetchCurrentUserGifticons();
  const now = new Date();
  const urgency = buildUrgencyBuckets(gifticons, now);
  const longTermGifticons = gifticons.filter((item) => {
    if (item.status !== "available") {
      return false;
    }

    return daysUntil(item.expiresAt, now) > 7;
  });
  const usedGifticons = gifticons
    .filter((item) => item.status === "used")
    .sort((a, b) => {
      const aTime = a.usedAt ? new Date(a.usedAt).getTime() : 0;
      const bTime = b.usedAt ? new Date(b.usedAt).getTime() : 0;
      return bTime - aTime;
    });
  const hasItems = urgency.today.length + urgency.soon.length + urgency.caution.length > 0;
  const hasAnyAvailable = gifticons.some((item) => item.status === "available");

  return (
    <section className="space-y-6">
      <header className="mb-5 space-y-1.5">
        <p className="text-sm font-semibold text-brand">만료 임박 우선</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">가족 기프티콘 홈</h1>
        <p className="text-base text-muted">
          먼저 써야 하는 쿠폰부터 보여줍니다. 기본 정렬은 만료일 오름차순입니다.
        </p>
      </header>

      {isAuthenticated ? (
        <PushNotificationControl
          vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
        />
      ) : null}

      {errorMessage ? (
        <div className="max-w-xl rounded-3xl border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">데이터를 불러오지 못했습니다.</p>
          <p className="text-base text-muted">{errorMessage}</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="max-w-xl rounded-3xl border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">로그인이 필요합니다.</p>
          <p className="text-base text-muted">Google 로그인 후 가족 기프티콘 데이터를 불러옵니다.</p>
          <Link
            className="mt-4 inline-flex rounded-xl border border-[#2f5ec4] px-3 py-2 font-semibold text-[#2f5ec4] transition hover:bg-[#f1f6ff]"
            href="/auth"
          >
            로그인하러 가기
          </Link>
        </div>
      ) : hasAnyAvailable ? (
        <div className="space-y-6">
          {hasItems ? <UrgencyBoard buckets={urgency} /> : null}

          {longTermGifticons.length > 0 ? (
            <section className="rounded-[1.25rem] border border-line bg-white p-4 shadow-panel">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-ink">여유 있음</h2>
                  <p className="mt-1 text-sm text-muted">D-8 이후 만료 예정 쿠폰입니다.</p>
                </div>
                <span className="rounded-full bg-[#edf7e8] px-2.5 py-1 text-xs font-semibold text-[#2d6a2d]">
                  {longTermGifticons.length}개
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {longTermGifticons.map((item) => (
                  <GifticonCard
                    key={item.id}
                    item={item}
                    ddayLabel={`D-${daysUntil(item.expiresAt, now)}`}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {usedGifticons.length > 0 ? (
            <section className="rounded-[1.25rem] border border-line bg-white p-4 shadow-panel">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-ink">사용 완료</h2>
                  <p className="mt-1 text-sm text-muted">이미 사용 처리한 기프티콘입니다. 필요하면 다시 되돌릴 수 있습니다.</p>
                </div>
                <span className="rounded-full bg-[#fff3dc] px-2.5 py-1 text-xs font-semibold text-[#8a5b12]">
                  {usedGifticons.length}개
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {usedGifticons.map((item) => (
                  <GifticonCard
                    key={item.id}
                    item={item}
                    ddayLabel={`D-${daysUntil(item.expiresAt, now)}`}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="max-w-xl rounded-3xl border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">등록된 기프티콘이 없습니다.</p>
          <p className="text-base text-muted">
            아직 등록된 쿠폰이 없습니다. 첫 기프티콘을 추가하면 홈과 캘린더에서 바로 확인할 수 있습니다.
          </p>
          <Link
            className="mt-4 inline-flex rounded-xl border border-[#2f5ec4] px-3 py-2 font-semibold text-[#2f5ec4] transition hover:bg-[#f1f6ff]"
            href="/gifticons/new"
          >
            기프티콘 등록하기
          </Link>
        </div>
      )}
    </section>
  );
}
