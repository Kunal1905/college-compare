"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CollegeCard } from "@/components/college-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { Pagination } from "@/components/pagination";
import { useSavedCollegeIds } from "@/hooks/use-saved-college-ids";
import { api } from "@/lib/api";
import { DEGREE_FILTER_OPTIONS } from "@/lib/degree-categories";
import { getErrorMessage } from "@/lib/utils";
import type { CollegeFilterValues, CollegeSummary, PaginationMeta } from "@/types";

const locations = [
  "Mumbai",
  "Pune",
  "New Delhi",
  "Chennai",
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
];
const feeOptions = [
  { label: "< 1 Lakh", value: "100000" },
  { label: "< 2 Lakh", value: "200000" },
  { label: "< 5 Lakh", value: "500000" },
];

const DEFAULT_MIN_RATING = "3";
const COLLEGES_PAGE_SIZE = 6;

type CachedCollegeResult = {
  colleges: CollegeSummary[];
  pagination: PaginationMeta;
};

const collegeResultsCache = new Map<string, CachedCollegeResult>();

const isCanceledRequest = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "ERR_CANCELED";

const sanitizeMinRating = (value: string | null) => {
  if (!value) {
    return DEFAULT_MIN_RATING;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 3 && parsed <= 5
    ? parsed.toFixed(1).replace(/\.0$/, "")
    : DEFAULT_MIN_RATING;
};

const sanitizeMaxFees = (value: string | null) => {
  if (!value) {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "";
};

type ReadableSearchParams = {
  get: (name: string) => string | null;
};

const getFiltersFromParams = (searchParams: ReadableSearchParams): CollegeFilterValues => ({
  search: searchParams.get("search")?.trim() ?? "",
  location: (searchParams.get("location") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  minRating: sanitizeMinRating(searchParams.get("minRating")),
  maxFees: sanitizeMaxFees(searchParams.get("maxFees")),
  course: searchParams.get("course")?.trim() ?? "",
  sort: searchParams.get("sort") === "fees_asc" ? "fees_asc" : "rating_desc",
});

const getPageFromParams = (searchParams: ReadableSearchParams) => {
  const pageValue = Number(searchParams.get("page") ?? "1");
  return Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
};

export const CollegesPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const parsedSearchParams = useMemo(
    () => new URLSearchParams(paramsKey),
    [paramsKey]
  );
  const appliedFilters = useMemo(
    () => getFiltersFromParams(parsedSearchParams),
    [parsedSearchParams]
  );
  const currentPage = useMemo(
    () => getPageFromParams(parsedSearchParams),
    [parsedSearchParams]
  );
  const selectedCourse = appliedFilters.course;
  const [filters, setFilters] = useState<CollegeFilterValues>(appliedFilters);
  const [colleges, setColleges] = useState<CollegeSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: COLLEGES_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { savedIds, markSaved } = useSavedCollegeIds();

  useEffect(() => {
    Promise.resolve().then(() => {
      setFilters(appliedFilters);
    });
  }, [appliedFilters]);

  useEffect(() => {
    const cacheKey = paramsKey || "default";
    const controller = new AbortController();

    const fetchColleges = async () => {
      const cachedResult = collegeResultsCache.get(cacheKey);

      if (cachedResult) {
        await Promise.resolve();
        setColleges(cachedResult.colleges);
        setPagination(cachedResult.pagination);
        setError("");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get("/api/colleges", {
          signal: controller.signal,
          params: {
            ...appliedFilters,
            page: currentPage,
            limit: COLLEGES_PAGE_SIZE,
          },
        });
        const nextColleges = response.data.data as CollegeSummary[];
        const nextPagination = response.data.pagination as PaginationMeta;

        collegeResultsCache.set(cacheKey, {
          colleges: nextColleges,
          pagination: nextPagination,
        });
        setColleges(nextColleges);
        setPagination(nextPagination);
        setError("");
      } catch (error) {
        if (isCanceledRequest(error)) {
          return;
        }

        setColleges([]);
        setPagination({
          page: currentPage,
          limit: COLLEGES_PAGE_SIZE,
          total: 0,
          totalPages: 1,
        });
        setError(getErrorMessage(error, "Unable to load colleges right now."));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchColleges();

    return () => {
      controller.abort();
    };
  }, [appliedFilters, currentPage, paramsKey]);

  const updateFilter = (
    field: Exclude<keyof CollegeFilterValues, "location">,
    value: string
  ) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const pushFilters = (nextFilters: CollegeFilterValues, nextPage = 1) => {
    const params = new URLSearchParams();

    if (nextFilters.search.trim()) {
      params.set("search", nextFilters.search.trim());
    }

    if (nextFilters.course) {
      params.set("course", nextFilters.course);
    }

    if (nextFilters.location.length > 0) {
      params.set("location", nextFilters.location.join(","));
    }

    if (nextFilters.maxFees) {
      params.set("maxFees", nextFilters.maxFees);
    }

    if (Number(nextFilters.minRating) > 3) {
      params.set("minRating", nextFilters.minRating);
    }

    if (nextFilters.sort !== "rating_desc") {
      params.set("sort", nextFilters.sort);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    router.push(`/colleges${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const resetFilters = () => {
    const clearedFilters: CollegeFilterValues = {
      search: "",
      course: "",
      location: [],
      minRating: DEFAULT_MIN_RATING,
      maxFees: "",
      sort: "rating_desc",
    };

    setFilters(clearedFilters);
    pushFilters(clearedFilters);
  };

  const clearSelectedCourse = () => {
    const nextFilters: CollegeFilterValues = {
      ...filters,
      course: "",
    };

    setFilters(nextFilters);
    pushFilters(nextFilters);
  };

  const heading = selectedCourse
    ? `Explore ${selectedCourse} Colleges`
    : "Explore Colleges";
  const description = selectedCourse
    ? `Browse institutions offering ${selectedCourse} programs, compare outcomes, and shortlist the right fit.`
    : "Find the perfect institution for your future education.";

  const toggleLocation = (location: string) => {
    setFilters((previous) => {
      const nextLocations = previous.location.includes(location)
        ? previous.location.filter((item) => item !== location)
        : [...previous.location, location];

      return {
        ...previous,
        location: nextLocations,
      };
    });
  };

  return (
    <div className="cc-container py-8">
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">
            {heading}
          </h1>
          <p className="text-on-surface-variant">{description}</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                pushFilters(filters);
              }
            }}
            placeholder="Search colleges, degrees, or locations..."
            className="cc-input py-3 pl-12 pr-4 text-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="cc-card sticky top-24 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface">
                Filters
              </h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-on-surface">
                  Degree / Category
                </label>
                <select
                  value={filters.course}
                  onChange={(event) => {
                    const nextFilters = {
                      ...filters,
                      course: event.target.value,
                    };

                    setFilters(nextFilters);
                    pushFilters(nextFilters);
                  }}
                  className="cc-input p-2.5 text-sm"
                >
                  {DEGREE_FILTER_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-on-surface">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(event) => updateFilter("sort", event.target.value)}
                  className="cc-input p-2.5 text-sm"
                >
                  <option value="rating_desc">Highest Rating</option>
                  <option value="fees_asc">Fees: Low to High</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-on-surface">
                  Location / State
                </label>
                <div className="space-y-2">
                  {locations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => toggleLocation(location)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                        filters.location.includes(location)
                          ? "bg-surface-container text-primary"
                          : "text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded border ${
                          filters.location.includes(location)
                            ? "border-primary bg-primary"
                            : "border-outline-variant bg-surface"
                        }`}
                      />
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-on-surface">
                  Max Fees (Annual)
                </label>
                <div className="space-y-2">
                  {feeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 text-sm text-on-surface-variant"
                    >
                      <input
                        type="radio"
                        name="maxFees"
                        checked={filters.maxFees === option.value}
                        onChange={() => updateFilter("maxFees", option.value)}
                        className="h-4 w-4 accent-primary"
                      />
                      {option.label}
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-on-surface-variant">
                    <input
                      type="radio"
                      name="maxFees"
                      checked={!filters.maxFees}
                      onChange={() => updateFilter("maxFees", "")}
                      className="h-4 w-4 accent-primary"
                    />
                    Any budget
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-on-surface">
                  Min Rating
                </label>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="0.1"
                  value={filters.minRating || DEFAULT_MIN_RATING}
                  onChange={(event) => updateFilter("minRating", event.target.value)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container accent-primary"
                />
                <div className="mt-2 flex justify-between text-xs text-outline">
                  <span>3.0</span>
                  <span>{filters.minRating || DEFAULT_MIN_RATING}+</span>
                  <span>5.0</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => pushFilters(filters)}
                disabled={isLoading}
                className="cc-button-primary w-full py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Applying..." : "Apply Filters"}
              </button>
            </div>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9">
          {selectedCourse ? (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-on-surface-variant">
                Selected:
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-white">
                {selectedCourse}
                <button
                  type="button"
                  onClick={clearSelectedCourse}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                  aria-label={`Clear ${selectedCourse} filter`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState
              title="Unable to load colleges"
              description={error}
              action={
                <button
                  type="button"
                  onClick={() => pushFilters(appliedFilters, currentPage)}
                  className="cc-button-secondary px-5 py-3 text-sm font-semibold"
                >
                  Retry
                </button>
              }
            />
          ) : colleges.length === 0 ? (
            <EmptyState
              title="No colleges found"
              description={
                selectedCourse
                  ? `No colleges matched the ${selectedCourse} category with your current filters.`
                  : "Try adjusting your filters or search terms to find what you're looking for."
              }
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="cc-button-secondary px-5 py-3 text-sm font-semibold"
                >
                  Reset All Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="mb-6 text-sm text-on-surface-variant">
                {pagination.total} colleges found
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {colleges.map((college) => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    isSaved={savedIds.has(college.id)}
                    onSaved={markSaved}
                  />
                ))}
              </div>

              <div className="mt-10">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => pushFilters(appliedFilters, page)}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
