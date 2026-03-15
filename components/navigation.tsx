import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toUserLabel(email: string | null | undefined, fullName: string | null | undefined) {
  if (fullName && fullName.trim()) {
    return fullName.trim();
  }

  if (email) {
    return email.split("@")[0] ?? email;
  }

  return "로그인됨";
}

export async function Navigation() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const userLabel = toUserLabel(user?.email, user?.user_metadata?.name as string | undefined);

  return (
    <nav className="sticky top-0 z-10 border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-3 sm:items-center">
          <Link
            className="max-w-[10rem] text-sm font-bold uppercase leading-tight tracking-[0.14em] text-ink sm:max-w-none"
            href="/"
          >
            Family
            <br className="sm:hidden" />
            <span className="sm:ml-2 sm:inline">Gifticon</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden rounded-full bg-[#eef3ff] px-3 py-2 text-sm font-medium text-[#244aa5] sm:inline-flex">
                  {userLabel}
                </span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3ff] text-sm font-semibold text-[#244aa5] sm:hidden">
                  {userLabel.slice(0, 2)}
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-full border border-[#d7def3] px-3 py-2 text-sm font-medium text-ink transition hover:border-[#b8c5ec] hover:bg-slate-50 sm:px-4"
                    aria-label="로그아웃"
                  >
                    <span className="hidden sm:inline">로그아웃</span>
                    <span className="sm:hidden">나감</span>
                  </button>
                </form>
              </>
            ) : (
              <Link
                className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink sm:px-4"
                href="/auth"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
          <Link
            className="flex min-h-[44px] items-center justify-center rounded-2xl border border-transparent px-2 py-2 text-center text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/"
          >
            홈
          </Link>
          <Link
            className="flex min-h-[44px] items-center justify-center rounded-2xl border border-transparent px-2 py-2 text-center text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/calendar"
          >
            캘린더
          </Link>
          <Link
            className="flex min-h-[44px] items-center justify-center rounded-2xl border border-transparent px-2 py-2 text-center text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/family/setup"
          >
            가족
          </Link>
          <Link
            className="flex min-h-[44px] items-center justify-center rounded-2xl border border-transparent px-2 py-2 text-center text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/gifticons/new"
          >
            등록
          </Link>
        </div>
      </div>
    </nav>
  );
}
