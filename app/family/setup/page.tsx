import Link from "next/link";
import { FamilySetupForm } from "@/components/family-setup-form";
import { fetchCurrentUserFamilies } from "@/lib/data/families";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FamilySetupPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const families = await fetchCurrentUserFamilies();

  if (!authData.user) {
    return (
      <section className="space-y-6">
        <header className="mb-5 space-y-1.5">
          <p className="text-sm font-semibold text-brand">가족 설정</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">가족 그룹 만들기</h1>
          <p className="text-base text-muted">기프티콘 공유를 시작하려면 먼저 가족 그룹이 필요합니다.</p>
        </header>

        <div className="max-w-xl rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">로그인이 필요합니다.</p>
          <p className="text-base text-muted">Google 로그인 후 가족 그룹을 만들 수 있습니다.</p>
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

  if (families.length > 0) {
    return (
      <section className="space-y-6">
        <header className="mb-5 space-y-1.5">
          <p className="text-sm font-semibold text-brand">가족 설정</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">이미 연결된 가족이 있습니다</h1>
          <p className="text-base text-muted">지금은 새 그룹보다 기존 가족에서 기프티콘 등록을 바로 시작하는 편이 좋습니다.</p>
        </header>

        <div className="max-w-2xl rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
          <p className="mb-2 text-base font-bold text-ink">현재 연결된 가족</p>
          <ul className="space-y-2 text-sm text-muted">
            {families.map((family) => (
              <li key={family.id}>
                {family.name} ({family.role})
              </li>
            ))}
          </ul>
          <Link
            className="mt-4 inline-flex rounded-xl border border-[#2f5ec4] px-3 py-2 font-semibold text-[#2f5ec4] transition hover:bg-[#f1f6ff]"
            href="/gifticons/new"
          >
            기프티콘 등록하러 가기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="mb-5 space-y-1.5">
        <p className="text-sm font-semibold text-brand">가족 설정</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">가족 그룹 만들기</h1>
        <p className="text-base text-muted">먼저 가족 그룹을 만든 뒤, 그 그룹에 기프티콘을 쌓아가면 됩니다.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
        <FamilySetupForm />

        <aside className="space-y-4 rounded-[1.75rem] border border-line bg-white p-5 shadow-panel">
          <div>
            <h2 className="text-base font-bold text-ink">어떻게 쓰이나요?</h2>
            <p className="mt-2 text-sm text-muted">가족 그룹은 기프티콘 데이터와 이미지 접근 권한의 기본 단위입니다.</p>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">생성 후 다음 단계</h2>
            <p className="mt-2 text-sm text-muted">가족이 만들어지면 바로 owner 멤버십이 연결되고, 곧바로 기프티콘 등록을 시작할 수 있습니다.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
