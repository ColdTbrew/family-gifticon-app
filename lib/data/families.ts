import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FamilyOption = {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
};

export type FamilyInviteSummary = {
  id: string;
  familyId: string;
  familyName: string;
  inviteCode: string;
  expiresAt: string;
  usedAt: string | null;
};

type FamilyMemberRow = {
  role: FamilyOption["role"];
  families:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

type FamilyInviteRow = {
  id: string;
  family_id: string;
  invite_code: string;
  expires_at: string;
  used_at: string | null;
  families:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

function toFamilyRecord(row: FamilyMemberRow): FamilyOption | null {
  const family = Array.isArray(row.families) ? row.families[0] : row.families;

  if (!family) {
    return null;
  }

  return {
    id: family.id,
    name: family.name,
    role: row.role
  };
}

export async function fetchCurrentUserFamilies(): Promise<FamilyOption[]> {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("family_members")
    .select("role,families!inner(id,name)")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as FamilyMemberRow[])
    .map(toFamilyRecord)
    .filter((family): family is FamilyOption => family !== null);
}

export async function fetchCurrentUserOwnedFamilies(): Promise<FamilyOption[]> {
  const families = await fetchCurrentUserFamilies();
  return families.filter((family) => family.role === "owner");
}

export async function fetchCurrentUserActiveInvites(): Promise<FamilyInviteSummary[]> {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("family_invites")
    .select("id,family_id,invite_code,expires_at,used_at,families(name)")
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as FamilyInviteRow[]).map((invite) => {
    const family = Array.isArray(invite.families) ? invite.families[0] : invite.families;

    return {
      id: invite.id,
      familyId: invite.family_id,
      familyName: family?.name ?? "가족",
      inviteCode: invite.invite_code,
      expiresAt: invite.expires_at,
      usedAt: invite.used_at
    };
  });
}
