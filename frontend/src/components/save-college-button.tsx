"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

type SaveCollegeButtonProps = {
  collegeId: number;
  initialSaved?: boolean;
  variant?: "icon" | "full";
  onSaved?: (collegeId: number) => void;
};

export const SaveCollegeButton = ({
  collegeId,
  initialSaved = false,
  variant = "icon",
  onSaved,
}: SaveCollegeButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleSave = async () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      toast.info("Please log in to save this college.");
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/saved")}`);
      return;
    }

    if (isSaved) {
      toast.success("This college is already in your saved list.");
      return;
    }

    try {
      setIsSaving(true);
      await api.post("/api/saved-colleges", { collegeId });
      setIsSaved(true);
      onSaved?.(collegeId);
      toast.success("College saved to your shortlist.");
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save this college.");
      const normalizedMessage = message.toLowerCase();

      if (normalizedMessage.includes("already")) {
        setIsSaved(true);
        onSaved?.(collegeId);
      }

      if (
        normalizedMessage.includes("token") ||
        normalizedMessage.includes("log in again") ||
        normalizedMessage.includes("unauthorized") ||
        normalizedMessage.includes("authentication")
      ) {
        logout();
        toast.info("Please log in again to save colleges.");
        router.push(`/login?redirect=${encodeURIComponent(pathname || "/saved")}`);
        return;
      }

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition ${
          isSaved
            ? "border-secondary-container bg-secondary-container/30 text-secondary"
            : "border-primary bg-white text-primary hover:bg-surface-container-low"
        } disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {isSaved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {isSaving ? "Saving..." : isSaved ? "Saved College" : "Save College"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${
        isSaved
          ? "border-secondary-container bg-secondary-container/30 text-secondary"
          : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-primary"
      } disabled:cursor-not-allowed disabled:opacity-70`}
      title={isSaved ? "Saved" : "Save college"}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </button>
  );
};
