import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
  };
};

type CreateSupabaseServerClientOptions = {
  response?: NextResponse;
};

export function createSupabaseServerClient(
  clientOptions: CreateSupabaseServerClientOptions = {}
) {
  const cookieStorePromise = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      async getAll() {
        const cookieStore = await cookieStorePromise;
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet: CookieToSet[]) {
        try {
          const cookieStore = await cookieStorePromise;
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may not allow mutating cookies in this context.
        }

        if (clientOptions.response) {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
            clientOptions.response!.cookies.set(name, value, cookieOptions);
          });
        }
      }
    }
  });
}
