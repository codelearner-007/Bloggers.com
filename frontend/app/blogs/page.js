import { Suspense } from 'react'
import { BlogList } from '@/components/blog/blog-list'
import { BlogListSkeleton } from '@/components/blog/blog-list-skeleton'
import { SearchInput } from '@/components/common/search-input'
import { parsePage } from '@/lib/pagination'

export const metadata = {
  title: 'All posts',
  description: 'Every published post on Bloggers.com.',
  alternates: { canonical: '/blogs' },
}

export default async function BlogsPage({ searchParams }) {
  const params = await searchParams
  const page = parsePage(params.page)
  const query = (params.q ?? '').trim()

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">All posts</h1>
        <SearchInput defaultValue={query} placeholder="Search posts" />
      </header>
      <Suspense key={`${query}-${page}`} fallback={<BlogListSkeleton count={12} />}>
        <BlogList page={page} query={query} />
      </Suspense>
    </main>
  )
}
