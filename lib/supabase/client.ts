import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://uwazavbrkjdtxbpdsnen.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_PLDfemiab7FPQQFlwOV62w_t605qyOP"
  );
}
