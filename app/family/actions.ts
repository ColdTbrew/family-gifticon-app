"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FamilyInviteActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

type CreateInviteCodeResult = {
  invite_code: string;
  expires_at: string;
};

type JoinFamilyResult = {
  family_id: string;
  family_name: string;
  joined: boolean;
};

function formatExpiry(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export async function createInviteCode(
  _prevState: FamilyInviteActionState,
  formData: FormData
): Promise<FamilyInviteActionState> {
  const familyIdValue = formData.get("familyId");
  const familyId = typeof familyIdValue === "string" ? familyIdValue.trim() : "";

  if (!familyId) {
    return {
      status: "error",
      message: "초대 코드를 만들 가족을 선택해주세요."
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      status: "error",
      message: "로그인 후 초대 코드를 만들 수 있습니다."
    };
  }

  const { data, error } = await supabase.rpc("create_family_invite_code", {
    target_family_id: familyId,
    validity_hours: 72
  });

  if (error) {
    return {
      status: "error",
      message: `초대 코드 생성에 실패했습니다: ${error.message}`
    };
  }

  const result = Array.isArray(data) ? (data[0] as CreateInviteCodeResult | undefined) : undefined;

  if (!result) {
    return {
      status: "error",
      message: "초대 코드 생성 결과를 받지 못했습니다."
    };
  }

  revalidatePath("/family/setup");

  return {
    status: "success",
    message: `초대 코드 ${result.invite_code} 생성됨 · ${formatExpiry(result.expires_at)}까지 사용 가능`
  };
}

export async function joinFamilyWithCode(
  _prevState: FamilyInviteActionState,
  formData: FormData
): Promise<FamilyInviteActionState> {
  const inviteCodeValue = formData.get("inviteCode");
  const inviteCode =
    typeof inviteCodeValue === "string" ? inviteCodeValue.trim().toUpperCase() : "";

  if (!inviteCode) {
    return {
      status: "error",
      message: "가족 코드를 입력해주세요."
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      status: "error",
      message: "로그인 후 가족 코드로 가입할 수 있습니다."
    };
  }

  const { data, error } = await supabase.rpc("join_family_by_invite_code", {
    invite_code_input: inviteCode
  });

  if (error) {
    return {
      status: "error",
      message: `가족 가입에 실패했습니다: ${error.message}`
    };
  }

  const result = Array.isArray(data) ? (data[0] as JoinFamilyResult | undefined) : undefined;

  if (!result) {
    return {
      status: "error",
      message: "가족 가입 결과를 받지 못했습니다."
    };
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons/new");
  revalidatePath("/family/setup");

  return {
    status: "success",
    message: result.joined
      ? `${result.family_name} 가족에 가입되었습니다.`
      : `${result.family_name} 가족에는 이미 가입되어 있습니다.`
  };
}

export async function deleteFamily(
  _prevState: FamilyInviteActionState,
  formData: FormData
): Promise<FamilyInviteActionState> {
  const familyIdValue = formData.get("familyId");
  const confirmationValue = formData.get("confirmation");
  const familyId = typeof familyIdValue === "string" ? familyIdValue.trim() : "";
  const confirmation = typeof confirmationValue === "string" ? confirmationValue.trim() : "";

  if (!familyId) {
    return {
      status: "error",
      message: "삭제할 가족을 선택해주세요."
    };
  }

  if (confirmation !== "삭제") {
    return {
      status: "error",
      message: '확인 문구로 "삭제"를 정확히 입력해주세요.'
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      status: "error",
      message: "로그인 후 가족을 삭제할 수 있습니다."
    };
  }

  const { data: familyMembership, error: membershipError } = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (membershipError || !familyMembership || familyMembership.role !== "owner") {
    return {
      status: "error",
      message: "가족 owner만 삭제할 수 있습니다."
    };
  }

  const { data: gifticonRows, error: gifticonError } = await supabase
    .from("gifticons")
    .select("id")
    .eq("family_id", familyId);

  if (!gifticonError && gifticonRows && gifticonRows.length > 0) {
    const gifticonIds = gifticonRows
      .map((row) => (typeof row.id === "string" ? row.id : null))
      .filter((id): id is string => Boolean(id));

    if (gifticonIds.length > 0) {
      const { data: imageRows, error: imageError } = await supabase
        .from("gifticon_images")
        .select("storage_path")
        .in("gifticon_id", gifticonIds);

      if (!imageError && imageRows && imageRows.length > 0) {
        const paths = imageRows
          .map((row) => (typeof row.storage_path === "string" ? row.storage_path : null))
          .filter((path): path is string => Boolean(path));

        if (paths.length > 0) {
          const { error: storageDeleteError } = await supabase.storage
            .from("gifticon-images")
            .remove(paths);
          if (storageDeleteError) {
            return {
              status: "error",
              message: `이미지 파일 삭제에 실패했습니다: ${storageDeleteError.message}`
            };
          }
        }
      }
    }
  }

  const { error: deleteError } = await supabase.from("families").delete().eq("id", familyId);

  if (deleteError) {
    return {
      status: "error",
      message: `가족 삭제에 실패했습니다: ${deleteError.message}`
    };
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/gifticons/new");
  revalidatePath("/family/setup");

  return {
    status: "success",
    message: "가족이 삭제되었습니다. 이제 새 가족을 만들 수 있습니다."
  };
}
