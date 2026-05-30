import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Compass",
  description:
    "Explore colleges, compare fees and placements, and build a saved shortlist with real backend data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background text-on-background">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
