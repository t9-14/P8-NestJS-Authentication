"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { login } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const { isChecking } = useAuthGuard({
    requireAuth: false,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

      router.replace(CONFIG.ROUTES.DASHBOARD);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Verifying session...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-[420px] border-border/80 shadow-[0_18px_50px_-30px_oklch(0.24_0.025_258_/_0.32)]">
        <CardHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><LockKeyhole className="size-5" /></div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">Organization management</p>
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>

          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div role="alert" className="rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={CONFIG.ROUTES.REGISTER}
              className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
