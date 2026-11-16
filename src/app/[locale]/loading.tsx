import React from "react";
import StorefrontSkeleton from "@/components/grocery/GrocerySkeleton";

export default function StorefrontLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8faf9] dark:bg-[#04130b]">
      {/* Top Header Placeholder Bar */}
      <div className="sticky top-0 z-40 w-full border-b border-gray-200/70 bg-white/80 backdrop-blur-xl dark:border-emerald-950/60 dark:bg-[#071910]/85">
        <div className="h-6 w-full bg-emerald-600/30 animate-shimmer" />
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/30 animate-shimmer" />
            <div className="h-6 w-32 rounded-lg bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
          </div>
          <div className="hidden max-w-md flex-1 lg:block mx-8">
            <div className="h-10 w-full rounded-2xl bg-gray-150 dark:bg-emerald-950/40 animate-shimmer" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 rounded-2xl bg-emerald-600/20 animate-shimmer" />
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Main Catalog Skeletons */}
      <main className="flex-1">
        <StorefrontSkeleton />
      </main>
    </div>
  );
}
