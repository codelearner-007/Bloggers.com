import { Skeleton } from '@/components/ui/skeleton'
import { BlogListSkeleton } from '@/components/blog/blog-list-skeleton'

export default function BlogsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-8 w-full max-w-sm" />
      </header>
      <BlogListSkeleton count={12} />
    </main>
  )
}
