"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeStatus(value: FormDataEntryValue | null): "available" | "used" | "expired" {
  if (value === "used" || value === "expired") {
    return value;
  }
  return "available";
}

function requireString(value: FormDataEntryValue | null, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} 값을 입력해주세요.`);
  }
  return value.trim();
}

export async function createGifticon(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    throw new Error("소속된 가족이 없습니다.");
  }

  const title = requireString(formData.get("title"), "이름");
  const brand = requireString(formData.get("brand"), "브랜드");
  const barcode = requireString(formData.get("barcode"), "바코드");
  const expiresAt = requireString(formData.get("expiresAt"), "만료일");
  const status = normalizeStatus(formData.get("status"));

  const { error } = await supabase.from("gifticons").insert({
    family_id: membership.family_id,
    created_by: user.id,
    title,
    brand,
    barcode,
    expires_at: expiresAt,
    status
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons");
}

export async function updateGifticon(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const id = requireString(formData.get("id"), "기프티콘 ID");
  const title = requireString(formData.get("title"), "이름");
  const brand = requireString(formData.get("brand"), "브랜드");
  const barcode = requireString(formData.get("barcode"), "바코드");
  const expiresAt = requireString(formData.get("expiresAt"), "만료일");
  const status = normalizeStatus(formData.get("status"));

  const { error } = await supabase
    .from("gifticons")
    .update({
      title,
      brand,
      barcode,
      expires_at: expiresAt,
      status
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons");
}

export async function deleteGifticon(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const id = requireString(formData.get("id"), "기프티콘 ID");

  const { error } = await supabase.from("gifticons").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons");
}
