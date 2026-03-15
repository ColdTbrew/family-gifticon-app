import { GoogleLoginButton } from "@/components/google-login-button";

export default function AuthPage() {
  return (
    <section className="space-y-6">
      <header className="mb-5 space-y-1.5">
        <p className="text-sm font-semibold text-brand">OAuth</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Google 로그인</h1>
        <p className="text-base text-muted">
          가족 그룹 데이터 접근을 위해 Google OAuth 로그인이 필요합니다.
        </p>
      </header>

      <div className="max-w-md">
        <GoogleLoginButton />
      </div>
    </section>
  );
}
