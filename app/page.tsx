import Link from "next/link";
import { redirect } from "next/navigation";
import { UrgencyBoard } from "@/components/urgency-board";
import { fetchCurrentUserGifticons } from "@/lib/data/gifticons";
import { buildUrgencyBuckets } from "@/lib/urgency";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: {
    code?: string | string[];
    next?: string | string[];
  };
};

function toSingleParam(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const oauthCode = toSingleParam(searchParams?.code);
  const next = toSingleParam(searchParams?.next);

  if (oauthCode) {
    const callbackUrl = new URL("http://localhost/auth/callback");
    callbackUrl.searchParams.set("code", oauthCode);
    if (next) {
      callbackUrl.searchParams.set("next", next);
    }
    redirect(`${callbackUrl.pathname}${callbackUrl.search}`);
  }

  const { gifticons, isAuthenticated, errorMessage } = await fetchCurrentUserGifticons();
  const urgency = buildUrgencyBuckets(gifticons, new Date());
  const hasItems = urgency.today.length + urgency.soon.length + urgency.caution.length > 0;

  return (
    <section className="space-y-6">
      <header className="mb-5 space-y-1.5">
        <p className="text-sm font-semibold text-brand">만료 임박 우선</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">가족 기프티콘 홈</h1>
        <p className="text-base text-muted">
          먼저 써야 하는 쿠폰부터 보여줍니다. 기본 정렬은 만료일 오름차순입니다.
        </p>
      </header>

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
      ) : hasItems ? (
        <UrgencyBoard buckets={urgency} />
      ) : (
        <div className="max-w-xl rounded-3xl border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">임박한 기프티콘이 없습니다.</p>
          <p className="text-base text-muted">
            현재는 D-7 이내 쿠폰이 없거나, 아직 등록된 쿠폰이 없습니다.
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
