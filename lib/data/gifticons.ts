import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCurrentFamilyContext } from "@/lib/data/family";
import { Gifticon, GifticonStatus } from "@/lib/types";

type GifticonRow = {
  id: string;
  title: string;
  brand: string;
  barcode: string;
  expires_at: string;
  status: GifticonStatus;
};

export type GifticonQueryResult = {
  gifticons: Gifticon[];
  isAuthenticated: boolean;
  errorMessage: string | null;
};

function mapGifticonRow(row: GifticonRow): Gifticon {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    barcode: row.barcode,
    expiresAt: row.expires_at,
    status: row.status
  };
}

export async function fetchCurrentUserGifticons(): Promise<GifticonQueryResult> {
  const familyContext = await fetchCurrentFamilyContext();

  if (!familyContext.isAuthenticated) {
    return {
      gifticons: [],
      isAuthenticated: false,
      errorMessage: familyContext.errorMessage
    };
  }

  if (!familyContext.familyId) {
    return {
      gifticons: [],
      isAuthenticated: true,
      errorMessage: familyContext.errorMessage
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gifticons")
    .select("id,title,brand,barcode,expires_at,status")
    .eq("family_id", familyContext.familyId)
    .order("expires_at", { ascending: true });

  if (error) {
    return {
      gifticons: [],
      isAuthenticated: true,
      errorMessage: error.message
    };
  }

  const rows = (data ?? []) as GifticonRow[];
  return {
    gifticons: rows.map(mapGifticonRow),
    isAuthenticated: true,
    errorMessage: null
  };
}
