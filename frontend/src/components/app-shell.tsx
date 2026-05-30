"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const AUTH_ROUTES = new Set(["/login", "/signup"]);

export const AppShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthRoute ? <Navbar /> : null}
      <main className="flex-1">{children}</main>
      {!isAuthRoute ? <Footer /> : null}
    </div>
  );
};
