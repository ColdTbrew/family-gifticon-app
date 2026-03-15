import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";
  const response = NextResponse.redirect(new URL(safeNext, requestUrl.origin));

  if (code) {
    const supabase = createSupabaseServerClient({ response });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If this Google account email is pre-registered for a family, auto-join on login.
      const { error: claimError } = await supabase.rpc("claim_family_memberships");
      if (claimError) {
        console.error("claim_family_memberships failed:", claimError.message);
      }
    }
  }

  return response;
}
