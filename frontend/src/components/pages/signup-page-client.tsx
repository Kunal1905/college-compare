"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export const SignupPageClient = () => {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/colleges");
    }
  }, [isAuthenticated, isHydrated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setServerError("");

    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Passwords do not match.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      toast.success("Account created successfully. Please log in.");
      router.push("/login");
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

      const message = getErrorMessage(error, "Unable to create your account.");
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
                Start Building Your Shortlist
              </h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-primary-fixed">
                Create an account to save colleges, compare options, and keep your
                college search organized across devices.
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
                <span className="text-sm font-semibold">Trusted by ambitious students</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-base italic leading-7 text-white">
                  &ldquo;Having my saved colleges and filters in one place made the
                  search process much easier to manage.&rdquo;
                </p>
                <p className="mt-3 text-sm font-semibold text-primary-fixed">
                  College Compass user journey
                </p>
              </div>
            </div>

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-white/10" />
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-4xl font-bold text-on-surface">Create Account</h2>
              <p className="mt-2 text-base text-on-surface-variant">
                Sign up to save colleges and continue your search anytime.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="cc-input px-4 py-3 text-sm"
                  placeholder="Jane Doe"
                />
                {fieldErrors.name ? (
                  <p className="mt-2 text-sm text-error">{fieldErrors.name}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="cc-input px-4 py-3 text-sm"
                  placeholder="jane@example.com"
                />
                {fieldErrors.email ? (
                  <p className="mt-2 text-sm text-error">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="cc-input px-4 py-3 text-sm"
                    placeholder="••••••••"
                  />
                  {fieldErrors.password ? (
                    <p className="mt-2 text-sm text-error">{fieldErrors.password}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="cc-input px-4 py-3 text-sm"
                    placeholder="••••••••"
                  />
                  {fieldErrors.confirmPassword ? (
                    <p className="mt-2 text-sm text-error">
                      {fieldErrors.confirmPassword}
                    </p>
                  ) : null}
                </div>
              </div>

              {serverError ? (
                <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-error">
                  {serverError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="cc-button-primary flex w-full items-center justify-center gap-2 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Already have an account?
                <Link href="/login" className="ml-1 font-semibold text-primary hover:underline">
                  Login
                </Link>
              </p>
            </div>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-secondary-container/30 bg-secondary-container/10 px-4 py-2 text-xs font-semibold text-secondary">
              <ShieldCheck className="h-4 w-4" />
              Custom JWT authentication enabled
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
