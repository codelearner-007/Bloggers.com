import { Skeleton } from '@/components/ui/skeleton'

export default function BlogPostLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-9 w-full max-w-xl" />
      <Skeleton className="mt-3 h-9 w-2/3 max-w-md" />

      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <Skeleton className="mt-8 aspect-video w-full rounded-lg" />

      <div className="mt-8 flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
