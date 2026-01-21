import { Skeleton } from "@/components/ui/skeleton"

export function ReportsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      {/* Table skeleton */}
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
