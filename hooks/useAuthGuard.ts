"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { supabase } from "@/lib/supabase";

interface AuthGuardOptions {
  requireAuth?: boolean;
}

export function useAuthGuard({
  requireAuth = true,
}: AuthGuardOptions = {}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const userIsAuth = await isAuthenticated();

      if (!active) return;

      if (requireAuth && !userIsAuth) {
        router.replace(CONFIG.ROUTES.LOGIN);
      } else if (!requireAuth && userIsAuth) {
        router.replace(CONFIG.ROUTES.DASHBOARD);
      } else {
        setIsChecking(false);
      }
    };

    void checkAuth();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT" && requireAuth) {
          setIsChecking(true);
          router.replace(CONFIG.ROUTES.LOGIN);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [requireAuth, router]);

  return { isChecking };
}