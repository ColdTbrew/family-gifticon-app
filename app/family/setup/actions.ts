"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FamilySetupState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialFamilySetupState: FamilySetupState = {
  status: "idle",
  message: null
};

export async function createFamily(
  _prevState: FamilySetupState,
  formData: FormData
): Promise<FamilySetupState> {
  const familyNameValue = formData.get("familyName");
  const familyName = typeof familyNameValue === "string" ? familyNameValue.trim() : "";

  if (!familyName) {
    return {
      status: "error",
      message: "가족 이름을 입력해주세요."
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      status: "error",
      message: "로그인 후 가족을 만들 수 있습니다."
    };
  }

  const { error } = await supabase.rpc("create_family_with_owner_membership", {
    family_name: familyName
  });

  if (error) {
    return {
      status: "error",
      message: `가족 생성에 실패했습니다: ${error.message}`
    };
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons/new");
  revalidatePath("/family/setup");

  return {
    status: "success",
    message: "가족 그룹이 생성되었습니다. 이제 기프티콘을 등록할 수 있습니다."
  };
}
