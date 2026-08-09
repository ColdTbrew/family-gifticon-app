"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card>
      <CardContent className="flex flex-col gap-3">
        <Button type="button" size="lg" className="w-full" onClick={handleLogin}>
          Google 계정으로 로그인
        </Button>
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
