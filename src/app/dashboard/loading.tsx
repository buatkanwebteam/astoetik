/** Skeleton inside the dashboard shell while the next dashboard page renders. */
export default function DashboardLoading() {
  const block = "animate-pulse rounded-3xl bg-tanah-900/[0.07] motion-reduce:animate-none dark:bg-white/10";
  return (
    <div role="status" aria-live="polite" className="w-full">
      <div className={`${block} h-11 w-2/3 max-w-md rounded-2xl`} />
      <div className={`${block} mt-3 h-4 w-1/2 max-w-sm rounded-full`} />
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className={`${block} h-28`} />
        <div className={`${block} h-28`} />
        <div className={`${block} h-28`} />
      </div>
      <div className={`${block} mt-6 h-64`} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`${block} h-48`} />
        <div className={`${block} h-48`} />
      </div>
      <span className="sr-only">Memuat halaman</span>
    </div>
  );
}
