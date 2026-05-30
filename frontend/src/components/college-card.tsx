import Link from "next/link";
import { IndianRupee, MapPin, Star } from "lucide-react";
import { SaveCollegeButton } from "@/components/save-college-button";
import {
  formatCompactIndianCurrency,
  formatPackage,
  formatPercentage,
} from "@/lib/utils";
import type { CollegeSummary } from "@/types";

type CollegeCardProps = {
  college: CollegeSummary;
  isSaved?: boolean;
  onSaved?: (collegeId: number) => void;
  action?: React.ReactNode;
};

export const CollegeCard = ({
  college,
  isSaved = false,
  onSaved,
  action,
}: CollegeCardProps) => {
  return (
    <article className="cc-card cc-card-hover overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        {college.imageUrl ? (
          <img
            src={college.imageUrl}
            alt={college.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-container via-surface-container-low to-surface" />
        )}

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-secondary">
            <Star className="h-4 w-4 fill-current" />
            {college.rating.toFixed(1)}
          </div>
          {action ?? (
            <SaveCollegeButton
              collegeId={college.id}
              initialSaved={isSaved}
              onSaved={onSaved}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
          <h3 className="text-[1.35rem] font-semibold tracking-tight text-on-surface">
            {college.name}
          </h3>
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-on-surface-variant">
            <MapPin className="h-4 w-4" />
            <span>
              {college.location}, {college.state}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-on-surface-variant [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {college.overview}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 border-y border-outline-variant py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
              Avg. Package
            </p>
            <p className="mt-1 text-sm font-semibold text-secondary">
              {formatPackage(college.averagePackage)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
              Placement
            </p>
            <p className="mt-1 text-sm font-semibold text-on-surface">
              {formatPercentage(college.placementRate)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            <IndianRupee className="h-4 w-4" />
            {formatCompactIndianCurrency(college.fees)} / yr
          </div>
          <Link
            href={`/colleges/${college.slug}`}
            className="cc-button-primary px-4 py-2 text-xs"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};
