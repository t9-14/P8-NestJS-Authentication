"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUser, logout } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();

  const { isChecking } = useAuthGuard({
    requireAuth: true,
  });

  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isChecking) return;

    const loadUser = async () => {
      const currentUser = await getUser();

      if (!currentUser) {
        router.replace(CONFIG.ROUTES.LOGIN);
        return;
      }

      setUser(currentUser);
    };

    void loadUser();
  }, [isChecking, router]);

  const handleLogout = async () => {
    setError("");
    setLoggingOut(true);

    try {
      await logout();

      router.replace(CONFIG.ROUTES.LOGIN);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Logout failed."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Verifying session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">

        <header className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>

          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </header>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Welcome back,{" "}
              {user.user_metadata?.username || "User"}!
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground">
              You are successfully logged in.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}