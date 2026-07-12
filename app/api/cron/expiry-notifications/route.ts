import { NextRequest, NextResponse } from "next/server";
import { sendExpiryNotifications } from "@/lib/push/send-expiry-notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendExpiryNotifications();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("expiry notification cron failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown cron error" },
      { status: 500 }
    );
  }
}
