import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

function BlogCardSkeleton() {
  return (
    <Card size="sm" className="h-full">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </CardFooter>
    </Card>
  )
}

export function BlogListSkeleton({ count }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  )
}
