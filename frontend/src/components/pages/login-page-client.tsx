"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import type { AuthUser } from "@/types";

export const LoginPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/colleges";
  const { login, isAuthenticated, isHydrated } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, isHydrated, redirectPath, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setServerError("");

    try {
      setIsSubmitting(true);
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const token = response.data.data.token as string;
      const user = response.data.data.user as AuthUser;

      login(token, user);
      toast.success("Logged in successfully.");
      router.push(redirectPath);
    } catch (error) {
      const responseData =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response
          ? error.response.data
          : null;

      if (
        responseData &&
        typeof responseData === "object" &&
        "errors" in responseData &&
        Array.isArray(responseData.errors)
      ) {
        const nextErrors: Record<string, string> = {};

        responseData.errors.forEach((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "field" in item &&
            "message" in item &&
            typeof item.field === "string" &&
            typeof item.message === "string"
          ) {
            nextErrors[item.field] = item.message;
          }
        });

        setFieldErrors(nextErrors);
      }

      const message = getErrorMessage(error, "Unable to log in right now.");
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant bg-surface">
        <div className="cc-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-7 w-7" />
            <span className="text-xl font-bold">College Compass</span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="cc-container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[1rem] border border-outline-variant bg-surface-container-lowest shadow-sm md:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary-container p-12 text-white md:flex">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">
                Chart Your Future Today
              </h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-primary-fixed">
                Access personalized recommendations, application tracking, and
                expert resources designed to simplify your journey to higher
                education.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="h-10 w-10 rounded-full border-2 border-primary bg-white/20"
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">Joined by 10k+ students</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-base italic leading-7 text-white">
                  &ldquo;This platform transformed how I searched for my dream
                  school. Every tool I needed was in one place.&rdquo;
                </p>
                <p className="mt-3 text-sm font-semibold text-primary-fixed">
                  Demo student experience
                </p>
              </div>
            </div>

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-white/10" />
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-4xl font-bold text-on-surface">Welcome Back</h2>
              <p className="mt-2 text-base text-on-surface-variant">
                Sign in to continue your discovery
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="cc-input py-3 pl-10 pr-4 text-sm"
                    placeholder="name@university.edu"
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="mt-2 text-sm text-error">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="cc-input py-3 pl-10 pr-4 text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {fieldErrors.password ? (
                  <p className="mt-2 text-sm text-error">{fieldErrors.password}</p>
                ) : null}
              </div>

              {serverError ? (
                <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-error">
                  {serverError}
                </div>
              ) : null}

              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cc-button-primary flex w-full items-center justify-center gap-2 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("demo@example.com");
                    setPassword("password123");
                    toast.success("Demo credentials applied.");
                  }}
                  className="cc-button-secondary flex w-full items-center justify-center gap-2 py-4 text-sm"
                >
                  <UserCheck className="h-4 w-4" />
                  Demo Login
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Don&apos;t have an account?
                <Link href="/signup" className="ml-1 font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-secondary-container/30 bg-secondary-container/10 px-4 py-2 text-xs font-semibold text-secondary">
              <ShieldCheck className="h-4 w-4" />
              Demo: demo@example.com / password123
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
