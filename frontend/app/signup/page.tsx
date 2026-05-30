"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export default function SignupPage() {
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
      setFieldErrors({ confirmPassword: "Passwords do not match." });
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
    <div className="cc-container flex min-h-screen items-center justify-center py-8">
      <main className="grid w-full max-w-[1000px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-white md:flex">
          <div>
            <Link href="/" className="mb-12 inline-block text-2xl font-extrabold">
              College Compass
            </Link>
            <h1 className="text-4xl font-bold leading-tight">
              Your future, mapped with precision.
            </h1>
            <p className="mt-6 text-lg leading-8 text-primary-fixed">
              Access data-driven insights for institutions across India and save
              the colleges that best match your academic and financial goals.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="h-10 w-10 rounded-full border-2 border-primary bg-white/20"
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-primary-fixed">
                Join 10k+ students today.
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm italic leading-7 text-white">
                "College Compass turned a stressful search into a clear,
                manageable path. I found my dream engineering school in weeks."
              </p>
            </div>
          </div>
        </section>

        <section className="p-8 md:p-12">
          <div className="mb-8">
            <div className="mb-6 text-center md:hidden">
              <span className="text-2xl font-extrabold text-primary">
                College Compass
              </span>
            </div>
            <h2 className="text-3xl font-semibold text-on-surface">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Save colleges, build your shortlist, and continue your search anytime.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-semibold text-on-surface">
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
              <label className="mb-1 block text-sm font-semibold text-on-surface">
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
                <label className="mb-1 block text-sm font-semibold text-on-surface">
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
                <label className="mb-1 block text-sm font-semibold text-on-surface">
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
              className="cc-button-primary w-full py-4 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
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

          <div className="mt-12 text-xs leading-6 text-outline">
            By creating an account, you agree to our Terms of Service and Privacy
            Policy. We use your data to personalize your college search experience.
          </div>
        </section>
      </main>
    </div>
  );
}
