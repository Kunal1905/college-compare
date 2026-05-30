"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  Download,
  MapPin,
  Star,
} from "lucide-react";
import { useParams } from "next/navigation";
import { CollegeCard } from "@/components/college-card";
import { CourseTable } from "@/components/course-table";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { ReviewCard } from "@/components/review-card";
import { SaveCollegeButton } from "@/components/save-college-button";
import { useSavedCollegeIds } from "@/hooks/use-saved-college-ids";
import { api } from "@/lib/api";
import {
  formatCompactIndianCurrency,
  formatIndianCurrency,
  formatPackage,
  formatPercentage,
  getErrorMessage,
} from "@/lib/utils";
import type { CollegeDetail, CollegeSummary } from "@/types";

export default function CollegeDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [relatedColleges, setRelatedColleges] = useState<CollegeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { savedIds, markSaved } = useSavedCollegeIds();

  useEffect(() => {
    if (!slug) {
      return;
    }

    const fetchCollege = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/colleges/${slug}`);
        const nextCollege = response.data.data as CollegeDetail;
        setCollege(nextCollege);
        setError("");

        const relatedResponse = await api.get("/api/colleges", {
          params: {
            location: nextCollege.state,
            limit: 4,
            sort: "rating_desc",
          },
        });

        const related = (relatedResponse.data.data as CollegeSummary[]).filter(
          (item) => item.slug !== nextCollege.slug
        );
        setRelatedColleges(related.slice(0, 3));
      } catch (error) {
        setError(getErrorMessage(error, "Unable to load this college."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollege();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="cc-container py-10">
        <LoadingState
          title="Loading college details"
          description="Pulling courses, placements, and reviews."
        />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="cc-container py-10">
        <EmptyState
          title="College details unavailable"
          description={error || "This college could not be found."}
          action={
            <Link
              href="/colleges"
              className="cc-button-secondary px-5 py-3 text-sm font-semibold"
            >
              Back to colleges
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="cc-container py-8">
      <section className="mb-12 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="relative h-[320px]">
          {college.imageUrl ? (
            <img
              src={college.imageUrl}
              alt={college.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surface-container via-surface-container-low to-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative -mt-20 px-8 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-lg border border-outline-variant bg-white text-2xl font-bold text-primary shadow-lg">
                {college.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-md">
                {college.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-white">
                <span className="inline-flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  {college.location}, {college.state}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-sm font-semibold text-secondary">
                  <Star className="h-4 w-4 fill-current" />
                  {college.rating.toFixed(1)} Rating
                </span>
                <div className="flex gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                    Public Focus
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                    Verified Data
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <div className="mb-1 text-xs uppercase tracking-[0.18em] text-primary-fixed">
                  Avg Annual Fee
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatCompactIndianCurrency(college.fees)}
                </div>
              </div>

              <SaveCollegeButton
                collegeId={college.id}
                initialSaved={savedIds.has(college.id)}
                onSaved={markSaved}
                variant="full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="cc-card p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
            Annual Fees
          </div>
          <div className="mt-2 text-2xl font-semibold text-primary">
            {formatIndianCurrency(college.fees)}
          </div>
          <div className="mt-1 text-sm text-on-surface-variant">Starting program fee</div>
        </div>
        <div className="cc-card p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
            Avg Package
          </div>
          <div className="mt-2 text-2xl font-semibold text-secondary">
            {college.placement ? formatPackage(college.placement.averagePackage) : "N/A"}
          </div>
          <div className="mt-1 text-sm text-on-surface-variant">Top engineering outcome</div>
        </div>
        <div className="cc-card p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
            Highest Package
          </div>
          <div className="mt-2 text-2xl font-semibold text-tertiary">
            {college.placement ? formatPackage(college.placement.highestPackage) : "N/A"}
          </div>
          <div className="mt-1 text-sm text-on-surface-variant">Best recorded offer</div>
        </div>
        <div className="cc-card p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
            Placement Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-on-surface">
            {college.placement ? formatPercentage(college.placement.placementRate) : "N/A"}
          </div>
          <div className="mt-1 text-sm text-on-surface-variant">Latest batch outcome</div>
        </div>
      </section>

      <div className="mb-8 flex overflow-x-auto border-b border-outline-variant">
        {[
          ["#overview", "Overview"],
          ["#courses", "Courses"],
          ["#placements", "Placements"],
          ["#reviews", "Reviews"],
        ].map(([href, label], index) => (
          <a
            key={href}
            href={href}
            className={`whitespace-nowrap px-8 py-4 text-sm font-semibold ${
              index === 0
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section id="overview">
            <h2 className="mb-4 text-3xl font-semibold text-on-surface">
              About {college.name}
            </h2>
            <p className="text-base leading-8 text-on-surface-variant">
              {college.overview}
            </p>
          </section>

          <section id="courses">
            <h2 className="mb-6 text-3xl font-semibold text-on-surface">
              Featured Courses
            </h2>
            <CourseTable courses={college.courses} />
          </section>

          <section id="placements">
            <h2 className="mb-6 text-3xl font-semibold text-on-surface">
              Top Recruiting Partners
            </h2>
            {college.placement ? (
              <div className="flex flex-wrap gap-4">
                {college.placement.topRecruiters.map((company) => (
                  <div
                    key={company}
                    className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm text-on-surface shadow-sm"
                  >
                    <BriefcaseBusiness className="h-4 w-4 text-primary" />
                    {company}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Placement data is not available for this college.
              </p>
            )}
          </section>

          <section id="reviews">
            <h2 className="mb-6 text-3xl font-semibold text-on-surface">
              Student Reviews
            </h2>
            <div className="grid gap-6">
              {college.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-xl bg-primary p-6 text-white shadow-sm">
            <h3 className="text-xl font-semibold">Interested in {college.name}?</h3>
            <p className="mt-3 text-sm leading-7 text-primary-fixed">
              Get a comprehensive counseling kit and track your shortlist from one
              place.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-surface-container-low">
              <Download className="h-4 w-4" />
              Download Brochure
            </button>
          </div>

          <div className="cc-card p-6">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <CalendarDays className="h-4 w-4" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                Upcoming Deadlines
              </p>
            </div>
            <div className="space-y-4 text-sm text-on-surface-variant">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-surface-container px-3 py-2 text-center text-primary">
                  <div className="text-xs font-semibold">JUL</div>
                  <div className="text-lg font-bold">12</div>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Application update window</p>
                  <p>Latest document review cycle begins.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-surface-container px-3 py-2 text-center text-primary">
                  <div className="text-xs font-semibold">AUG</div>
                  <div className="text-lg font-bold">05</div>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Scholarship shortlist</p>
                  <p>Financial aid communication for selected students.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {relatedColleges.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-3xl font-semibold text-on-surface">
            Similar Institutes You May Like
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedColleges.map((item) => (
              <CollegeCard
                key={item.id}
                college={item}
                isSaved={savedIds.has(item.id)}
                onSaved={markSaved}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
