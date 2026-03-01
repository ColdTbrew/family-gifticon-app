import { GoogleLoginButton } from "@/components/google-login-button";

export default function AuthPage() {
  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">OAuth</p>
        <h1>Google 로그인</h1>
        <p className="muted">
          가족 그룹 데이터 접근을 위해 Google OAuth 로그인이 필요합니다.
        </p>
      </header>

      <div className="auth-panel">
        <GoogleLoginButton />
      </div>
    </section>
  );
}
