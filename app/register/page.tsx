"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRoundPlus } from "lucide-react";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { register, logout } from "@/lib/auth";
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

export default function RegisterPage() {
  const router = useRouter();

  const { isChecking } = useAuthGuard({
    requireAuth: false,
  });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await register(
        username,
        email,
        password
      );

      // End the automatically created session.
      if (data.session) {
        await logout();

        alert(
          "Registration successful! Please log in to your account."
        );

        router.replace(CONFIG.ROUTES.LOGIN);
        router.refresh();
      } else {
        setSuccess(
          "Please check your email to confirm your account before logging in."
        );
      }

    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) return null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-[420px] border-border/80 shadow-[0_18px_50px_-30px_oklch(0.24_0.025_258_/_0.32)]">

        <CardHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><UserRoundPlus className="size-5" /></div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">Organization management</p>
          <CardTitle className="text-2xl font-semibold tracking-tight">Create your account</CardTitle>

          <CardDescription>
            Register a new account to get started.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">

            {error && (
              <div role="alert" className="rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">
                Username
              </Label>

              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
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
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-4">

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!success}
            >
              {loading
                ? "Registering..."
                : "Register"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}

              <Link
                href={CONFIG.ROUTES.LOGIN}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </p>

          </CardFooter>
        </form>

      </Card>
    </main>
  );
}
