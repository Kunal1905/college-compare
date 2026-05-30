import { Star } from "lucide-react";
import type { Review } from "@/types";

export const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <article className="cc-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-on-surface">{review.student}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-outline">
            Student review
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-secondary-container/30 px-3 py-1.5 text-sm font-semibold text-secondary">
          <Star className="h-4 w-4 fill-current" />
          {review.rating.toFixed(1)}
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant">{review.comment}</p>
    </article>
  );
};
