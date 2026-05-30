"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CollegeCard } from "@/components/college-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import type { SavedCollegeItem } from "@/types";

export default function SavedPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, logout } = useAuth();
  const [savedColleges, setSavedColleges] = useState<SavedCollegeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent("/saved")}`);
      return;
    }

    const fetchSavedColleges = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/saved-colleges");
        setSavedColleges(response.data.data);
        setError("");
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to load saved colleges right now."
        );

        if (message.toLowerCase().includes("token")) {
          logout();
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedColleges();
  }, [isAuthenticated, isHydrated, logout, router]);

  const handleRemove = async (collegeId: number) => {
    try {
      await api.delete(`/api/saved-colleges/${collegeId}`);
      setSavedColleges((previous) =>
        previous.filter((college) => college.id !== collegeId)
      );
      toast.success("College removed from saved list.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to remove this college."));
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="cc-container py-12">
        <LoadingState
          title="Loading saved colleges"
          description="Checking your shortlist and saved preferences."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cc-container py-12">
        <EmptyState
          title="Unable to load saved colleges"
          description={error}
          action={
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="cc-button-secondary px-5 py-3 text-sm font-semibold"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (savedColleges.length === 0) {
    return (
      <div className="cc-container py-12">
        <EmptyState
          title="No saved colleges yet"
          description="Start exploring and save your favorite institutions to see them here for easy comparison."
          action={
            <Link
              href="/colleges"
              className="cc-button-primary px-6 py-3 text-sm font-semibold"
            >
              Browse Colleges
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="cc-container py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-on-surface">
          My Saved Colleges
        </h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Your personalized shortlist of colleges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {savedColleges.map((college) => (
          <CollegeCard
            key={college.savedId}
            college={college}
            action={
              <button
                type="button"
                onClick={() => handleRemove(college.id)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-error/20 bg-error-container/30 text-error transition hover:bg-error-container/50"
                title="Remove from saved"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
          />
        ))}
      </div>
    </div>
  );
}
