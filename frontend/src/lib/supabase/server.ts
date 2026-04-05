import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for server-side usage (Server Components, Route Handlers).
 * Reads the session from cookies set by Supabase Auth.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore — this is called from a Server Component where cookies can't be set.
            // The middleware will handle refreshing the session.
          }
        },
      },
    }
  );
}
