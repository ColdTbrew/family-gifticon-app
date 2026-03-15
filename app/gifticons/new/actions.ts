"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const GIFTICON_IMAGE_BUCKET = "gifticon-images";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export type GifticonUploadState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isAllowedImageType(contentType: string): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(contentType);
}

export async function createGifticon(
  _prevState: GifticonUploadState,
  formData: FormData
): Promise<GifticonUploadState> {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      status: "error",
      message: "로그인 후 등록할 수 있습니다."
    };
  }

  const familyId = getString(formData, "familyId");
  const title = getString(formData, "title");
  const brand = getString(formData, "brand");
  const barcode = getString(formData, "barcode");
  const expiresAt = getString(formData, "expiresAt");
  const memo = getString(formData, "memo");
  const image = formData.get("image");

  if (!familyId || !title || !brand || !barcode || !expiresAt) {
    return {
      status: "error",
      message: "브랜드, 이름, 바코드/쿠폰번호, 만료일은 필수입니다."
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("family_id", familyId)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      status: "error",
      message: "선택한 가족에 등록할 권한이 없습니다."
    };
  }

  let uploadedStoragePath: string | null = null;
  const gifticonId = crypto.randomUUID();

  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        status: "error",
        message: "이미지는 10MB 이하만 업로드할 수 있습니다."
      };
    }

    if (!isAllowedImageType(image.type)) {
      return {
        status: "error",
        message: "JPG, PNG, WebP, HEIC 이미지 파일만 업로드할 수 있습니다."
      };
    }

    const extension = image.name.includes(".")
      ? image.name.split(".").pop()?.toLowerCase() ?? "jpg"
      : image.type.split("/").pop() ?? "jpg";

    uploadedStoragePath = `${familyId}/${gifticonId}/original.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(GIFTICON_IMAGE_BUCKET)
      .upload(uploadedStoragePath, image, {
        cacheControl: "3600",
        contentType: image.type,
        upsert: false
      });

    if (uploadError) {
      return {
        status: "error",
        message:
          uploadError.message.includes("Bucket not found")
            ? "이미지 저장소가 아직 준비되지 않았습니다. Supabase 마이그레이션을 먼저 적용해주세요."
            : `이미지 업로드에 실패했습니다: ${uploadError.message}`
      };
    }
  }

  const { error: insertError } = await supabase.from("gifticons").insert({
    id: gifticonId,
    family_id: familyId,
    title,
    brand,
    barcode,
    expires_at: expiresAt,
    memo: memo || null,
    created_by: authData.user.id
  });

  if (insertError) {
    if (uploadedStoragePath) {
      await supabase.storage.from(GIFTICON_IMAGE_BUCKET).remove([uploadedStoragePath]);
    }

    return {
      status: "error",
      message: `기프티콘을 저장하지 못했습니다: ${insertError.message}`
    };
  }

  if (uploadedStoragePath) {
    const { error: imageInsertError } = await supabase.from("gifticon_images").insert({
      gifticon_id: gifticonId,
      storage_path: uploadedStoragePath
    });

    if (imageInsertError) {
      await supabase.from("gifticons").delete().eq("id", gifticonId);
      await supabase.storage.from(GIFTICON_IMAGE_BUCKET).remove([uploadedStoragePath]);

      return {
        status: "error",
        message: `이미지 정보를 저장하지 못했습니다: ${imageInsertError.message}`
      };
    }
  }

  const { error: eventError } = await supabase.from("gifticon_events").insert({
    gifticon_id: gifticonId,
    event_type: "created",
    actor_id: authData.user.id,
    payload: {
      hasImage: Boolean(uploadedStoragePath)
    }
  });

  if (eventError) {
    console.error("gifticon created event failed:", eventError.message);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons/new");

  return {
    status: "success",
    message: uploadedStoragePath
      ? "기프티콘과 이미지가 함께 등록되었습니다."
      : "기프티콘이 등록되었습니다."
  };
}
