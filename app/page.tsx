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
    <section>
      <header className="page-header">
        <p className="eyebrow">만료 임박 우선</p>
        <h1>가족 기프티콘 홈</h1>
        <p className="muted">
          먼저 써야 하는 쿠폰부터 보여줍니다. 기본 정렬은 만료일 오름차순입니다.
        </p>
      </header>

      {!isAuthenticated ? (
        <div className="notice-card">
          <p className="notice-title">로그인이 필요합니다.</p>
          <p className="muted">Google 로그인 후 가족 기프티콘 데이터를 불러옵니다.</p>
          <Link className="action-link" href="/auth">
            로그인하러 가기
          </Link>
        </div>
      ) : errorMessage ? (
        <div className="notice-card">
          <p className="notice-title">데이터를 불러오지 못했습니다.</p>
          <p className="muted">{errorMessage}</p>
        </div>
      ) : hasItems ? (
        <UrgencyBoard buckets={urgency} />
      ) : (
        <div className="notice-card">
          <p className="notice-title">임박한 기프티콘이 없습니다.</p>
          <p className="muted">
            현재는 D-7 이내 쿠폰이 없거나, 아직 등록된 쿠폰이 없습니다.
          </p>
        </div>
      )}
    </section>
  );
}
