export default function ServiceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">

      <div className="mb-6 flex items-center justify-between">

        <div className="space-y-2">
          <div className="h-5 w-28 rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-3 w-36 rounded bg-gray-200 dark:bg-zinc-800" />
        </div>

        <div className="h-6 w-6 rounded bg-gray-200 dark:bg-zinc-800" />

      </div>

      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 p-4"
          >
            <div className="flex items-center justify-between">

              <div className="space-y-2">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-zinc-800" />
              </div>

              <div className="space-y-2 text-right">
                <div className="ml-auto h-5 w-16 rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="ml-auto h-3 w-10 rounded bg-gray-200 dark:bg-zinc-800" />
              </div>

            </div>

            <div className="mt-4 h-10 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />

          </div>
        ))}
      </div>

    </div>
  );
}