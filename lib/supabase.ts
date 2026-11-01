import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://uwazavbrkjdtxbpdsnen.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_PLDfemiab7FPQQFlwOV62w_t605qyOP";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
