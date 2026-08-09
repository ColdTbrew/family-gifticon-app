import Link from "next/link";
import { FamilyAllowlistForm } from "@/components/family-allowlist-form";
import { FamilyDeleteForm } from "@/components/family-delete-form";
import { FamilyInviteForm } from "@/components/family-invite-form";
import { FamilyJoinForm } from "@/components/family-join-form";
import { FamilySetupForm } from "@/components/family-setup-form";
import { PageState } from "@/components/page-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  fetchCurrentUserActiveInvites,
  fetchCurrentUserFamilies,
  fetchCurrentUserOwnedFamilies
} from "@/lib/data/families";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FamilySetupPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const families = await fetchCurrentUserFamilies();
  const ownedFamilies = await fetchCurrentUserOwnedFamilies();
  const activeInvites = await fetchCurrentUserActiveInvites();

  if (!authData.user) {
    return (
      <section className="flex flex-col gap-6">
        <header className="mb-5 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-brand">가족 설정</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">가족 그룹 만들기</h1>
          <p className="text-base text-muted-foreground">기프티콘 공유를 시작하려면 먼저 가족 그룹이 필요합니다.</p>
        </header>

        <PageState
          title="로그인이 필요합니다."
          description="Google 로그인 후 가족 그룹을 만들 수 있습니다."
          action={{ href: "/auth", label: "로그인하러 가기" }}
        />
      </section>
    );
  }

  if (families.length > 0) {
    return (
      <section className="flex flex-col gap-6">
        <header className="mb-5 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-brand">가족 설정</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">이미 연결된 가족이 있습니다</h1>
          <p className="text-base text-muted-foreground">지금은 새 그룹보다 기존 가족에서 기프티콘 등록을 바로 시작하는 편이 좋습니다.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>현재 연결된 가족</CardTitle>
                <CardDescription>로그인한 계정이 참여 중인 그룹입니다.</CardDescription>
              </CardHeader>
              <CardContent>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {families.map((family) => (
                  <li key={family.id} className="flex items-center justify-between gap-3">
                    <span>{family.name}</span>
                    <Badge variant="secondary">{family.role}</Badge>
                  </li>
                ))}
              </ul>
              </CardContent>
              <CardFooter>
              <Link
                className={cn(buttonVariants({ variant: "outline" }))}
                href="/gifticons/new"
              >
                기프티콘 등록하러 가기
              </Link>
              </CardFooter>
            </Card>

            <FamilyInviteForm ownedFamilies={ownedFamilies} />
            <FamilyAllowlistForm ownedFamilies={ownedFamilies} />
            <FamilyDeleteForm ownedFamilies={ownedFamilies} />
          </div>

          <div className="flex flex-col gap-6">
            <FamilyJoinForm />

            <Card>
              <CardHeader>
                <CardTitle>현재 유효한 가족 코드</CardTitle>
                <CardDescription>owner가 만든 최신 코드를 가족에게 보내주세요.</CardDescription>
              </CardHeader>
              <CardContent>
              {activeInvites.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activeInvites.map((invite) => (
                    <Card key={invite.id} size="sm">
                      <CardHeader>
                        <CardTitle>{invite.familyName}</CardTitle>
                        <Badge variant="secondary">{invite.inviteCode}</Badge>
                      </CardHeader>
                      <CardContent>
                      <p className="text-xs text-muted-foreground">
                        만료:{" "}
                        {new Intl.DateTimeFormat("ko-KR", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        }).format(new Date(invite.expiresAt))}
                      </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">아직 활성화된 가족 코드가 없습니다.</p>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="mb-5 flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-brand">가족 설정</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">가족 그룹 만들기</h1>
        <p className="text-base text-muted-foreground">먼저 가족 그룹을 만든 뒤, 그 그룹에 기프티콘을 쌓아가면 됩니다.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
        <div className="flex flex-col gap-6">
          <FamilySetupForm />

          <Card>
            <CardHeader>
              <CardTitle>가족 그룹 안내</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">어떻게 쓰이나요?</h3>
              <p className="mt-2 text-sm text-muted-foreground">가족 그룹은 기프티콘 데이터와 이미지 접근 권한의 기본 단위입니다.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">생성 후 다음 단계</h3>
              <p className="mt-2 text-sm text-muted-foreground">가족이 만들어지면 owner 멤버십이 연결되고 바로 기프티콘 등록을 시작할 수 있습니다.</p>
            </div>
            </CardContent>
          </Card>
        </div>

        <FamilyJoinForm />
      </div>
    </section>
  );
}
