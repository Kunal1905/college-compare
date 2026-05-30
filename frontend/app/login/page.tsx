import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { LoginPageClient } from "@/components/pages/login-page-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          title="Loading login"
          description="Preparing your sign-in experience."
        />
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
