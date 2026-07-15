export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050B18]">
      <div className="flex flex-col items-center gap-5">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

        <h2 className="text-lg font-semibold text-white">
          Loading Dashboard...
        </h2>

        <p className="text-sm text-zinc-400">
          Please wait while we prepare your workspace.
        </p>
      </div>
    </div>
  );
}