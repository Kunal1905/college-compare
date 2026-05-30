"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookmarkPlus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { CollegeCard } from "@/components/college-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { api } from "@/lib/api";
import { DEGREE_CATEGORIES } from "@/lib/degree-categories";
import { formatPackage, getErrorMessage } from "@/lib/utils";
import type { CollegeSummary } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [featuredColleges, setFeaturedColleges] = useState<CollegeSummary[]>([]);
  const [stats, setStats] = useState({
    totalColleges: 0,
    statesCovered: 0,
    averageRating: 0,
    topAveragePackage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/colleges", {
          params: {
            limit: 24,
            sort: "rating_desc",
          },
        });

        const colleges = response.data.data as CollegeSummary[];
        const totalColleges = response.data.pagination.total as number;
        const statesCovered = new Set(colleges.map((college) => college.state)).size;
        const averageRating =
          colleges.reduce((sum, college) => sum + college.rating, 0) /
          Math.max(colleges.length, 1);
        const topAveragePackage = Math.max(
          ...colleges.map((college) => college.averagePackage),
          0
        );

        setFeaturedColleges(colleges.slice(0, 3));
        setStats({
          totalColleges,
          statesCovered,
          averageRating,
          topAveragePackage,
        });
        setError("");
      } catch (error) {
        setError(
          getErrorMessage(error, "Unable to load featured colleges right now.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  const handleSearch = () => {
    const query = search.trim();
    router.push(query ? `/colleges?search=${encodeURIComponent(query)}` : "/colleges");
  };

  return (
    <div>
      <section className="bg-surface">
        <div className="cc-container px-4 pb-24 pt-16 text-center sm:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              Stitch UI integrated with live backend APIs
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-on-surface md:text-6xl">
              Find the Right College for{" "}
              <span className="text-primary">Your Future</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-on-surface-variant">
              Explore colleges across India with verified fees, placement data, and
              saved shortlists powered by your backend.
            </p>

            <div className="mx-auto mt-10 max-w-2xl">
              <div className="flex items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-lg">
                <Search className="ml-3 h-5 w-5 text-outline" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search colleges, courses, cities..."
                  className="w-full bg-transparent px-3 py-3 text-sm text-on-surface outline-none placeholder:text-outline"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="cc-button-primary px-8 py-3 text-sm"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {DEGREE_CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/colleges?course=${encodeURIComponent(category)}`}
                  className="rounded-full bg-surface-container px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-container hover:text-white"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-12 text-white">
        <div className="cc-container grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          <div>
            <div className="text-3xl font-bold">{stats.totalColleges}+</div>
            <div className="mt-1 text-sm text-primary-fixed">Colleges Listed</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.statesCovered}+</div>
            <div className="mt-1 text-sm text-primary-fixed">States Covered</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="mt-1 text-sm text-primary-fixed">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {formatPackage(stats.topAveragePackage)}
            </div>
            <div className="mt-1 text-sm text-primary-fixed">Top Avg. Package</div>
          </div>
        </div>
      </section>

      <section className="cc-container px-4 py-24 sm:px-8">
        <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">
              Featured Institutions
            </h2>
            <p className="mt-2 text-base text-on-surface-variant">
              Handpicked colleges based on student satisfaction and placement
              strength.
            </p>
          </div>
          <Link
            href="/colleges"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            View All Colleges
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingState
            title="Loading featured colleges"
            description="Getting a few strong starting options ready."
          />
        ) : error ? (
          <EmptyState
            title="Could not load featured colleges"
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
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {featuredColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface-container-low py-20">
        <div className="cc-container px-4 text-center sm:px-8">
          <h2 className="text-3xl font-bold text-on-surface">
            Why Choose College Compass?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-on-surface-variant">
            We simplify the complex path of choosing the right education with data
            you can trust.
          </p>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Smart Search",
                description:
                  "Filter by specialization, location, fees, and more to find your perfect match instantly.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Insights",
                description:
                  "Access authenticated placement statistics and campus reviews from real student data.",
              },
              {
                icon: BookmarkPlus,
                title: "Save Shortlist",
                description:
                  "Compare your favorite colleges side-by-side and keep track of options as you narrow down.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-on-surface">{item.title}</h3>
                <p className="text-sm leading-7 text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-[1rem] bg-primary px-6 py-12 text-white shadow-lg sm:px-12">
            <h3 className="text-3xl font-bold">
              Start exploring colleges that match your goals
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-primary-fixed">
              Take the first step towards a successful career with our comprehensive
              college discovery engine.
            </p>
            <Link
              href="/colleges"
              className="mt-8 inline-flex rounded-xl bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-surface-container-low"
            >
              Browse Colleges
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
