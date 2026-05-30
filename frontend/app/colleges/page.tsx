import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { CollegesPageClient } from "@/components/pages/colleges-page-client";

export default function CollegesPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          title="Loading college listings"
          description="Preparing search and filter controls."
        />
      }
    >
      <CollegesPageClient />
    </Suspense>
  );
}
