import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Gifticon, GifticonStatus } from "@/lib/types";

const IMAGE_SIGNED_URL_EXPIRY_SECONDS = 60 * 60;

type GifticonRow = {
  id: string;
  title: string | null;
  brand: string;
  barcode: string | null;
  expires_at: string;
  status: GifticonStatus;
  used_at: string | null;
  gifticon_images:
    | {
        storage_path: string;
      }[]
    | null;
};

export type GifticonQueryResult = {
  gifticons: Gifticon[];
  isAuthenticated: boolean;
  errorMessage: string | null;
};

function toUserFacingErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.";
  }

  if (error.message.toLowerCase().includes("fetch failed")) {
    return "Supabase 서버에 연결할 수 없습니다. 네트워크 또는 프로젝트 설정을 확인해주세요.";
  }

  return error.message;
}

function isMissingAuthSession(errorMessage: string | null | undefined): boolean {
  if (!errorMessage) {
    return false;
  }

  return errorMessage.toLowerCase().includes("auth session missing");
}

function mapGifticonRow(row: GifticonRow): Gifticon {
  return {
    id: row.id,
    title: row.title || `${row.brand} 기프티콘`,
    brand: row.brand,
    barcode: row.barcode || "",
    expiresAt: row.expires_at,
    status: row.status,
    imageUrl: null,
    usedAt: row.used_at
  };
}

export async function fetchCurrentUserGifticons(): Promise<GifticonQueryResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      if (isMissingAuthSession(authError.message)) {
        return {
          gifticons: [],
          isAuthenticated: false,
          errorMessage: null
        };
      }

      return {
        gifticons: [],
        isAuthenticated: false,
        errorMessage: toUserFacingErrorMessage(authError)
      };
    }

    if (!authData.user) {
      return {
        gifticons: [],
        isAuthenticated: false,
        errorMessage: null
      };
    }

    const { data, error } = await supabase
      .from("gifticons")
      .select("id,title,brand,barcode,expires_at,status,used_at,gifticon_images(storage_path)")
      .order("expires_at", { ascending: true });

    if (error) {
      return {
        gifticons: [],
        isAuthenticated: true,
        errorMessage: error.message
      };
    }

    const rows = (data ?? []) as GifticonRow[];
    const storagePaths = rows
      .flatMap((row) => row.gifticon_images ?? [])
      .map((image) => image.storage_path)
      .filter((path) => Boolean(path));
    const uniqueStoragePaths = Array.from(new Set(storagePaths));

    const signedUrlMap = new Map<string, string>();

    if (uniqueStoragePaths.length > 0) {
      await Promise.all(
        uniqueStoragePaths.map(async (storagePath) => {
          const { data: originalUrlData, error: originalUrlError } = await supabase.storage
            .from("gifticon-images")
            .createSignedUrl(storagePath, IMAGE_SIGNED_URL_EXPIRY_SECONDS);

          if (!originalUrlError && originalUrlData?.signedUrl) {
            signedUrlMap.set(storagePath, originalUrlData.signedUrl);
            return;
          }

          console.error("gifticon image signed url failed:", {
            storagePath,
            originalUrlError: originalUrlError?.message ?? null
          });
        })
      );
    }

    return {
      gifticons: rows.map((row) => {
        const mapped = mapGifticonRow(row);
        const firstImage = row.gifticon_images?.[0];
        return {
          ...mapped,
          imageUrl: firstImage ? signedUrlMap.get(firstImage.storage_path) ?? null : null
        };
      }),
      isAuthenticated: true,
      errorMessage: null
    };
  } catch (error) {
    return {
      gifticons: [],
      isAuthenticated: false,
      errorMessage: toUserFacingErrorMessage(error)
    };
  }
}
