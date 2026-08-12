import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const IMAGE_BUCKET = "gifticon-images";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;
const SIGNED_URL_CACHE_WINDOW_SECONDS = 45 * 60;

export async function getSignedImageUrlMap(storagePaths: string[]): Promise<Map<string, string>> {
  const uniquePaths = Array.from(new Set(storagePaths.filter(Boolean))).sort();
  if (uniquePaths.length === 0) {
    return new Map();
  }

  const windowKey = Math.floor(
    Date.now() / (SIGNED_URL_CACHE_WINDOW_SECONDS * 1000)
  );
  const signedUrls = await createCachedSignedImageUrls(uniquePaths, windowKey);

  return new Map(signedUrls.map(({ path, signedUrl }) => [path, signedUrl]));
}

type SignedImageUrl = {
  path: string;
  signedUrl: string;
};

const createCachedSignedImageUrls = unstable_cache(
  async (storagePaths: string[], windowKey: number): Promise<SignedImageUrl[]> => {
    // The time window changes the cache key before any signed URL can expire.
    void windowKey;

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .createSignedUrls(storagePaths, SIGNED_URL_EXPIRY_SECONDS);

    if (error) {
      throw new Error(`Failed to create gifticon image URLs: ${error.message}`);
    }

    return data.flatMap(({ error: itemError, path, signedUrl }) => {
      if (itemError || !path || !signedUrl) {
        console.error("gifticon image signed url failed:", {
          storagePath: path,
          error: itemError
        });
        return [];
      }

      return [{ path, signedUrl }];
    });
  },
  ["gifticon-image-signed-urls-v1"],
  { revalidate: SIGNED_URL_EXPIRY_SECONDS }
);
