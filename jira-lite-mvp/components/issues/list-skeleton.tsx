import { Skeleton } from '@/components/ui/skeleton';

export function ListSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <Skeleton className="col-span-1 h-4" />
        <Skeleton className="col-span-4 h-4" />
        <Skeleton className="col-span-2 h-4" />
        <Skeleton className="col-span-1 h-4" />
        <Skeleton className="col-span-2 h-4" />
        <Skeleton className="col-span-2 h-4" />
      </div>

      {/* Table Rows */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
        <div key={row} className="grid grid-cols-12 gap-4 border-b border-zinc-200 p-4 last:border-0 dark:border-zinc-800">
          <Skeleton className="col-span-1 h-4" />
          <Skeleton className="col-span-4 h-4" />
          <Skeleton className="col-span-2 h-5 w-24" />
          <Skeleton className="col-span-1 h-5 w-16" />
          <div className="col-span-2 flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="col-span-2 h-4" />
        </div>
      ))}
    </div>
  );
}
