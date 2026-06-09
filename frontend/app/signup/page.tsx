import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { SignupPageClient } from "@/components/pages/signup-page-client";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          title="Loading sign up"
          description="Preparing your account creation experience."
        />
      }
    >
      <SignupPageClient />
    </Suspense>
  );
}
