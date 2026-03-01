import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      gifticons: [],
      isAuthenticated: false,
      errorMessage: authError?.message ?? null
    };
  }

  const { data, error } = await supabase
    .from("gifticons")
    .select("id,title,brand,barcode,expires_at,status")
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
