import Link from "next/link";

export function Navigation() {
  return (
    <nav className="sticky top-0 z-10 border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="text-sm font-bold tracking-[0.14em] text-ink uppercase" href="/">
        Family Gifticon
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/"
          >
            홈
          </Link>
          <Link
            className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/calendar"
          >
            캘린더
          </Link>
          <Link
            className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/family/setup"
          >
            가족
          </Link>
          <Link
            className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/gifticons/new"
          >
            등록
          </Link>
          <Link
            className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-line hover:bg-slate-50 hover:text-ink"
            href="/auth"
          >
            로그인
          </Link>
        </div>
      </div>
    </nav>
  );
}
