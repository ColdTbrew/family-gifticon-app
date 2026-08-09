import { redirect } from "next/navigation";
import { daysUntil } from "@/lib/date";
import { GifticonCard } from "@/components/gifticon-card";
import { PageState } from "@/components/page-state";
import { PushNotificationControl } from "@/components/push-notification-control";
import { UrgencyBoard } from "@/components/urgency-board";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
    <section className="flex flex-col gap-6">
      <header className="mb-5 flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-brand">만료 임박 우선</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">가족 기프티콘 홈</h1>
        <p className="text-base text-muted-foreground">
          먼저 써야 하는 쿠폰부터 보여줍니다. 기본 정렬은 만료일 오름차순입니다.
        </p>
      </header>

      {isAuthenticated ? (
        <PushNotificationControl
          vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
        />
      ) : null}

      {errorMessage ? (
        <PageState
          variant="error"
          title="데이터를 불러오지 못했습니다."
          description={errorMessage}
        />
      ) : !isAuthenticated ? (
        <PageState
          title="로그인이 필요합니다."
          description="Google 로그인 후 가족 기프티콘 데이터를 불러옵니다."
          action={{ href: "/auth", label: "로그인하러 가기" }}
        />
      ) : hasAnyAvailable ? (
        <div className="flex flex-col gap-6">
          {hasItems ? <UrgencyBoard buckets={urgency} /> : null}

          {longTermGifticons.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>여유 있음</CardTitle>
                <CardDescription>D-8 이후 만료 예정 쿠폰입니다.</CardDescription>
                <CardAction>
                  <Badge variant="success">{longTermGifticons.length}개</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {longTermGifticons.map((item) => (
                  <GifticonCard
                    key={item.id}
                    item={item}
                    ddayLabel={`D-${daysUntil(item.expiresAt, now)}`}
                  />
                ))}
              </CardContent>
            </Card>
          ) : null}

          {usedGifticons.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>사용 완료</CardTitle>
                <CardDescription>
                  이미 사용 처리한 기프티콘입니다. 필요하면 다시 되돌릴 수 있습니다.
                </CardDescription>
                <CardAction>
                  <Badge variant="warning">{usedGifticons.length}개</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {usedGifticons.map((item) => (
                  <GifticonCard
                    key={item.id}
                    item={item}
                    ddayLabel={`D-${daysUntil(item.expiresAt, now)}`}
                  />
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        <PageState
          title="등록된 기프티콘이 없습니다."
          description="첫 기프티콘을 추가하면 홈과 캘린더에서 바로 확인할 수 있습니다."
          action={{ href: "/gifticons/new", label: "기프티콘 등록하기" }}
        />
      )}
    </section>
  );
}
