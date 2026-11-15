export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-7 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-4 w-72 rounded-md bg-gray-100 dark:bg-gray-800/60" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* KPI Stat Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-28 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table / Card Skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-9 w-44 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800/60"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800/60" />
                </div>
              </div>
              <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
