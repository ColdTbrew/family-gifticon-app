import Link from "next/link";
import { GifticonUploadForm } from "@/components/gifticon-upload-form";
import { fetchCurrentUserFamilies } from "@/lib/data/families";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewGifticonPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const families = await fetchCurrentUserFamilies();

  if (!authData.user) {
    return (
      <section className="space-y-6">
        <header className="mb-5 space-y-1.5">
          <p className="text-sm font-semibold text-brand">새 기프티콘</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">기프티콘 등록</h1>
          <p className="text-base text-muted">기프티콘 정보와 이미지를 올려 가족과 함께 관리할 수 있습니다.</p>
        </header>

        <div className="max-w-xl rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">로그인이 필요합니다.</p>
          <p className="text-base text-muted">기프티콘 등록은 Google 로그인 후 사용할 수 있습니다.</p>
          <Link
            className="mt-4 inline-flex rounded-xl border border-[#2f5ec4] px-3 py-2 font-semibold text-[#2f5ec4] transition hover:bg-[#f1f6ff]"
            href="/auth"
          >
            로그인하러 가기
          </Link>
        </div>
      </section>
    );
  }

  if (families.length === 0) {
    return (
      <section className="space-y-6">
        <header className="mb-5 space-y-1.5">
          <p className="text-sm font-semibold text-brand">새 기프티콘</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">기프티콘 등록</h1>
          <p className="text-base text-muted">등록하려면 먼저 가족 그룹에 속해 있어야 합니다.</p>
        </header>

        <div className="max-w-2xl rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">등록 가능한 가족이 없습니다.</p>
          <p className="text-base text-muted">
            현재 로그인한 계정이 어떤 가족 그룹에도 속해 있지 않아 기프티콘을 저장할 수 없습니다. 가족 생성/초대 흐름을 먼저 붙이거나, Supabase에서 `family_members` 데이터가 연결되어 있는지 확인해주세요.
          </p>
          <Link
            className="mt-4 inline-flex rounded-xl border border-[#2f5ec4] px-3 py-2 font-semibold text-[#2f5ec4] transition hover:bg-[#f1f6ff]"
            href="/family/setup"
          >
            가족 그룹 만들기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="mb-5 space-y-1.5">
        <p className="text-sm font-semibold text-brand">새 기프티콘</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">기프티콘 등록</h1>
        <p className="text-base text-muted">
          브랜드, 쿠폰번호, 만료일을 먼저 등록하고 필요하면 이미지를 함께 올리세요.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <GifticonUploadForm families={families} />

        <aside className="space-y-4 rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
          <div>
            <h2 className="text-base font-bold text-ink">등록 팁</h2>
            <p className="mt-2 text-sm text-muted">실물 바코드가 없어도 쿠폰번호만 있으면 먼저 저장해둘 수 있습니다.</p>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">권장 순서</h2>
            <p className="mt-2 text-sm text-muted">1. 브랜드와 상품명 입력 2. 만료일 입력 3. 바코드 또는 쿠폰번호 입력 4. 필요하면 이미지 첨부</p>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">이미지 저장</h2>
            <p className="mt-2 text-sm text-muted">이미지는 Supabase Storage의 `gifticon-images` 버킷에 가족별 경로로 저장됩니다.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
