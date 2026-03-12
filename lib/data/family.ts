import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentFamilyContext = {
  isAuthenticated: boolean;
  familyId: string | null;
  errorMessage: string | null;
};

export async function fetchCurrentFamilyContext(): Promise<CurrentFamilyContext> {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      isAuthenticated: false,
      familyId: null,
      errorMessage: authError?.message ?? null
    };
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: true })
    .limit(2);

  if (membershipError) {
    return {
      isAuthenticated: true,
      familyId: null,
      errorMessage: membershipError.message
    };
  }

  if (!memberships || memberships.length === 0) {
    return {
      isAuthenticated: true,
      familyId: null,
      errorMessage: "소속된 가족이 없습니다."
    };
  }

  if (memberships.length > 1) {
    return {
      isAuthenticated: true,
      familyId: null,
      errorMessage: "여러 가족에 속해 있습니다. 현재 가족 선택 기능을 먼저 구현해야 합니다."
    };
  }

  return {
    isAuthenticated: true,
    familyId: memberships[0].family_id,
    errorMessage: null
  };
}
