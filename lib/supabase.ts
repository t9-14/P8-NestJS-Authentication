import { createBrowserClient } from "@supabase/ssr";
import { CONFIG } from "./config";

export const supabase = createBrowserClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);