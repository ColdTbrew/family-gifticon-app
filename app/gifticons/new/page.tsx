import { GifticonUploadForm } from "@/components/gifticon-upload-form";
import { PageState } from "@/components/page-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCurrentUserFamilies } from "@/lib/data/families";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewGifticonPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const families = await fetchCurrentUserFamilies();

  if (!authData.user) {
    return (
      <section className="flex flex-col gap-6">
        <header className="mb-5 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-brand">새 기프티콘</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">기프티콘 등록</h1>
          <p className="text-base text-muted-foreground">기프티콘 정보와 이미지를 올려 가족과 함께 관리할 수 있습니다.</p>
        </header>

        <PageState
          title="로그인이 필요합니다."
          description="기프티콘 등록은 Google 로그인 후 사용할 수 있습니다."
          action={{ href: "/auth", label: "로그인하러 가기" }}
        />
      </section>
    );
  }

  if (families.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <header className="mb-5 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-brand">새 기프티콘</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">기프티콘 등록</h1>
          <p className="text-base text-muted-foreground">등록하려면 먼저 가족 그룹에 속해 있어야 합니다.</p>
        </header>

        <PageState
          title="등록 가능한 가족이 없습니다."
          description="현재 계정이 가족 그룹에 속해 있지 않습니다. 가족을 만들거나 초대 코드로 먼저 합류해주세요."
          action={{ href: "/family/setup", label: "가족 그룹 만들기" }}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="mb-5 flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-brand">새 기프티콘</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">기프티콘 등록</h1>
        <p className="text-base text-muted-foreground">
          브랜드, 만료일, 이미지는 필수로 등록하고 쿠폰번호와 메모는 필요할 때 추가하세요.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <GifticonUploadForm families={families} />

        <Card>
          <CardHeader>
            <CardTitle>등록 팁</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">이미지부터 저장</h3>
            <p className="mt-2 text-sm text-muted-foreground">실물 바코드가 없어도 이미지만 있으면 먼저 저장해둘 수 있습니다.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">권장 순서</h3>
            <p className="mt-2 text-sm text-muted-foreground">1. 브랜드와 상품명 입력 2. 만료일 입력 3. 이미지 첨부 4. 쿠폰번호 보완</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">이미지 저장</h3>
            <p className="mt-2 text-sm text-muted-foreground">이미지는 가족별로 분리된 저장 공간에 안전하게 보관됩니다.</p>
          </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
