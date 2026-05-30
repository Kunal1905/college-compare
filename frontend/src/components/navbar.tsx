"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/colleges", label: "Colleges" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user, isHydrated } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/95 backdrop-blur-sm">
      <div className="cc-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <GraduationCap className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight">College Compass</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 pb-1 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {isHydrated && isAuthenticated && (
            <Link
              href="/saved"
              className={`border-b-2 pb-1 text-sm font-semibold transition ${
                pathname === "/saved"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              Saved
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!isHydrated ? (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-surface-container" />
          ) : isAuthenticated && user ? (
            <>
              <div className="hidden rounded-full bg-surface-container px-4 py-2 text-sm font-medium text-on-surface-variant sm:block">
                {user.name.split(" ")[0]}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="cc-button-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-container"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="cc-button-primary px-5 py-2 text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
