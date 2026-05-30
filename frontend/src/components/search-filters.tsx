import { Search } from "lucide-react";
import type { CollegeFilterValues } from "@/types";

const locations = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai"];
const feeOptions = [
  { label: "< 1 Lakh", value: "100000" },
  { label: "< 2 Lakh", value: "200000" },
  { label: "< 5 Lakh", value: "500000" },
];

type SearchFiltersProps = {
  values: CollegeFilterValues;
  onChange: (
    field: Exclude<keyof CollegeFilterValues, "location">,
    value: string
  ) => void;
  onToggleLocation: (location: string) => void;
  onApply: () => void;
  onReset: () => void;
  isLoading: boolean;
};

export const SearchFilters = ({
  values,
  onChange,
  onToggleLocation,
  onApply,
  onReset,
  isLoading,
}: SearchFiltersProps) => {
  return (
    <>
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">
            Explore Colleges
          </h1>
          <p className="text-base text-on-surface-variant">
            Find the perfect institution for your future education.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <input
            value={values.search}
            onChange={(event) => onChange("search", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onApply();
              }
            }}
            placeholder="Search colleges, degrees, or locations..."
            className="cc-input py-3 pl-12 pr-4 text-sm"
          />
        </div>
      </header>

      <aside className="cc-card sticky top-24 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface">
            Filters
          </h2>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-semibold text-on-surface">
              Sort By
            </label>
            <select
              value={values.sort}
              onChange={(event) => onChange("sort", event.target.value)}
              className="cc-input p-2.5 text-sm"
            >
              <option value="rating_desc">Highest Rating</option>
              <option value="fees_asc">Fees: Low to High</option>
            </select>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-on-surface">
              Location
            </label>
            <div className="space-y-2">
              {locations.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => onToggleLocation(location)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                    values.location.includes(location)
                      ? "bg-surface-container text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded border ${
                      values.location.includes(location)
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
                    checked={values.maxFees === option.value}
                    onChange={() => onChange("maxFees", option.value)}
                    className="h-4 w-4 accent-primary"
                  />
                  {option.label}
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-3 text-sm text-on-surface-variant">
                <input
                  type="radio"
                  name="maxFees"
                  checked={!values.maxFees}
                  onChange={() => onChange("maxFees", "")}
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
              value={values.minRating || "4"}
              onChange={(event) => onChange("minRating", event.target.value)}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container accent-primary"
            />
            <div className="mt-2 flex justify-between text-xs text-outline">
              <span>3.0</span>
              <span>{values.minRating || "4.0"}+</span>
              <span>5.0</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="cc-button-primary w-full py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Applying..." : "Apply Filters"}
          </button>
        </div>
      </aside>
    </>
  );
};
