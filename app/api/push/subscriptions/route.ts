import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SubscriptionRequest = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

function isValidSubscription(value: SubscriptionRequest): value is {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} {
  if (
    typeof value.endpoint !== "string" ||
    value.endpoint.length > 4096 ||
    typeof value.keys?.p256dh !== "string" ||
    typeof value.keys.auth !== "string" ||
    value.keys.p256dh.length > 512 ||
    value.keys.auth.length > 512
  ) {
    return false;
  }

  try {
    return new URL(value.endpoint).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as SubscriptionRequest | null;
  if (!body || !isValidSubscription(body)) {
    return NextResponse.json({ error: "유효하지 않은 알림 구독입니다." }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: authData.user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      user_agent: request.headers.get("user-agent"),
      updated_at: new Date().toISOString()
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("push subscription upsert failed:", error.message);
    return NextResponse.json({ error: "알림 구독을 저장하지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (!body || typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "구독 주소가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", authData.user.id)
    .eq("endpoint", body.endpoint);

  if (error) {
    console.error("push subscription delete failed:", error.message);
    return NextResponse.json({ error: "알림 구독을 해제하지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
