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
    <div className="rounded-3xl border border-line bg-white p-4 shadow-panel">
      <button
        type="button"
        className="w-full rounded-2xl border border-[#1f4287] bg-[#2f5ec4] px-4 py-3 text-[0.95rem] font-bold text-white transition hover:bg-[#264eaa]"
        onClick={handleLogin}
      >
        Google 계정으로 로그인
      </button>
      {errorMessage ? <p className="mt-3 text-sm text-danger">{errorMessage}</p> : null}
    </div>
  );
}
