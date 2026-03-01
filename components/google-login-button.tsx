"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";

export function GoogleLoginButton() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setErrorMessage(null);
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "로그인 요청 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="auth-box">
      <button type="button" className="google-login-button" onClick={handleLogin}>
        Google 계정으로 로그인
      </button>
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
    </div>
  );
}
