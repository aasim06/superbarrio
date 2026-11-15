"use client";

import { useEffect } from "react";
import Button from "@/components/ui/button/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
        <svg
          className="size-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
        Something went wrong
      </h3>
      <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
        An error occurred while loading this administrative section. Please try again or refresh the page.
      </p>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
        <Button size="sm" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
