"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";

export const useSavedCollegeIds = () => {
  const { isAuthenticated, isHydrated } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      Promise.resolve().then(() => {
        setSavedIds(new Set());
      });
      return;
    }

    const fetchSaved = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/saved-colleges");
        const ids = new Set<number>(
          (response.data.data as Array<{ id: number }>).map((college) => college.id)
        );
        setSavedIds(ids);
      } catch {
        setSavedIds(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaved();
  }, [isAuthenticated, isHydrated]);

  const markSaved = (collegeId: number) => {
    setSavedIds((previous) => new Set(previous).add(collegeId));
  };

  const unmarkSaved = (collegeId: number) => {
    setSavedIds((previous) => {
      const next = new Set(previous);
      next.delete(collegeId);
      return next;
    });
  };

  return {
    savedIds,
    isLoading,
    markSaved,
    unmarkSaved,
  };
};
