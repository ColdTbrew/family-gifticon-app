import Link from "next/link";

export function Navigation() {
  return (
    <nav className="top-nav">
      <Link className="brand" href="/">
        Family Gifticon
      </Link>
      <div className="top-nav-links">
        <Link href="/">홈</Link>
        <Link href="/calendar">캘린더</Link>
        <Link href="/gifticons">기프티콘 관리</Link>
        <Link href="/auth">로그인</Link>
      </div>
    </nav>
  );
}
