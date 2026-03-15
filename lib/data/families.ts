import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FamilyOption = {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
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
