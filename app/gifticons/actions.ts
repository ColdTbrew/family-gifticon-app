"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markGifticonUsed(formData: FormData) {
  const gifticonIdValue = formData.get("gifticonId");
  const gifticonId = typeof gifticonIdValue === "string" ? gifticonIdValue.trim() : "";

  if (!gifticonId) {
    return;
  }

  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return;
  }

  const usedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("gifticons")
    .update({
      status: "used",
      used_at: usedAt,
      used_by: authData.user.id
    })
    .eq("id", gifticonId)
    .eq("status", "available");

  if (updateError) {
    console.error("markGifticonUsed failed:", updateError.message);
    return;
  }

  const { error: eventError } = await supabase.from("gifticon_events").insert({
    gifticon_id: gifticonId,
    event_type: "used",
    actor_id: authData.user.id,
    payload: {}
  });

  if (eventError) {
    console.error("gifticon used event failed:", eventError.message);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons/new");
}
