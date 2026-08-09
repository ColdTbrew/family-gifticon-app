import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/current-user";
import { cn } from "@/lib/utils";

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
  const { data } = await getCurrentUser();
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
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {userLabel}
                </Badge>
                <Badge variant="secondary" className="size-11 sm:hidden">
                  {userLabel.slice(0, 2)}
                </Badge>
                <form action={signOut}>
                  <Button type="submit" variant="outline" className="rounded-full" aria-label="로그아웃">
                    <span className="hidden sm:inline">로그아웃</span>
                    <span className="sm:hidden">나감</span>
                  </Button>
                </form>
              </>
            ) : (
              <Link
                className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}
                href="/auth"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
          <Link className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "w-full sm:w-auto")} href="/">
            홈
          </Link>
          <Link className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "w-full sm:w-auto")} href="/calendar">
            캘린더
          </Link>
          <Link className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "w-full sm:w-auto")} href="/family/setup">
            가족
          </Link>
          <Link className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "w-full sm:w-auto")} href="/gifticons/new">
            등록
          </Link>
        </div>
      </div>
    </nav>
  );
}
