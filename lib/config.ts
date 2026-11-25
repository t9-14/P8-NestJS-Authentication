export const CONFIG = {
  SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL!,

  SUPABASE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

  API_BASE_URL: "",

  ENDPOINTS: {
    POSITIONS: "/api/positions",
  },

  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
  },
} as const;
