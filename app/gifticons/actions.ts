"use server";

import { revalidatePath } from "next/cache";
import { parseDateOnly, toDateInputValue } from "@/lib/date";
import { fetchCurrentFamilyContext } from "@/lib/data/family";
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

function requireDateString(value: FormDataEntryValue | null, field: string): string {
  const normalized = requireString(value, field);
  const parsed = parseDateOnly(normalized);

  if (Number.isNaN(parsed.getTime()) || toDateInputValue(parsed) !== normalized) {
    throw new Error(`${field} 형식이 올바르지 않습니다.`);
  }

  return normalized;
}

async function requireCurrentFamilyId() {
  const familyContext = await fetchCurrentFamilyContext();

  if (!familyContext.isAuthenticated) {
    throw new Error("로그인이 필요합니다.");
  }

  if (!familyContext.familyId) {
    throw new Error(familyContext.errorMessage ?? "현재 가족 정보를 확인할 수 없습니다.");
  }

  return familyContext.familyId;
}

export async function createGifticon(formData: FormData) {
  const familyId = await requireCurrentFamilyId();
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const title = requireString(formData.get("title"), "이름");
  const brand = requireString(formData.get("brand"), "브랜드");
  const barcode = requireString(formData.get("barcode"), "바코드");
  const expiresAt = requireDateString(formData.get("expiresAt"), "만료일");
  const status = normalizeStatus(formData.get("status"));

  const { error } = await supabase.from("gifticons").insert({
    family_id: familyId,
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
  const familyId = await requireCurrentFamilyId();
  const supabase = createSupabaseServerClient();
  const id = requireString(formData.get("id"), "기프티콘 ID");
  const title = requireString(formData.get("title"), "이름");
  const brand = requireString(formData.get("brand"), "브랜드");
  const barcode = requireString(formData.get("barcode"), "바코드");
  const expiresAt = requireDateString(formData.get("expiresAt"), "만료일");
  const status = normalizeStatus(formData.get("status"));

  const { error, data } = await supabase
    .from("gifticons")
    .update({
      title,
      brand,
      barcode,
      expires_at: expiresAt,
      status
    })
    .eq("id", id)
    .eq("family_id", familyId)
    .select("id")
    .maybeSingle();

  if (!error && !data) {
    throw new Error("수정할 기프티콘을 찾지 못했습니다.");
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons");
}

export async function deleteGifticon(formData: FormData) {
  const familyId = await requireCurrentFamilyId();
  const supabase = createSupabaseServerClient();
  const id = requireString(formData.get("id"), "기프티콘 ID");

  const { error, data } = await supabase
    .from("gifticons")
    .delete()
    .eq("id", id)
    .eq("family_id", familyId)
    .select("id")
    .maybeSingle();

  if (!error && !data) {
    throw new Error("삭제할 기프티콘을 찾지 못했습니다.");
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons");
}
