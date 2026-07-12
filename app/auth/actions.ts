"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", data.user.id);

    if (error && !error.message.toLowerCase().includes("push_subscriptions")) {
      console.error("push subscription cleanup on sign out failed:", error.message);
    }
  }

  await supabase.auth.signOut();
  redirect("/");
}
