import Link from 'next/link'
import { PenSquareIcon } from 'lucide-react'
import { requireUser } from '@/lib/auth/session'
import { apiSend, ApiError } from '@/lib/api/fastapi-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { PagePagination } from '@/components/common/page-pagination'
import { DeleteBlogButton } from '@/app/(app)/my-blogs/delete-blog-button'
import { parsePage, PAGE_SIZES } from '@/lib/pagination'

export const metadata = { title: 'My blogs' }

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const STATUS_BADGE_VARIANT = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
}

export default async function MyBlogsPage({ searchParams }) {
  await requireUser()

  const params = await searchParams
  const page = parsePage(params.page)
  const status = STATUS_FILTERS.some((filter) => filter.value === params.status) ? params.status : ''

  let blogs = []
  let totalItems = 0
  let totalPages = 1

  try {
    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZES.myBlogs) })
    if (status) query.set('status', status)
    const result = await apiSend(`/api/v1/me/blogs?${query.toString()}`)
    blogs = result?.items ?? []
    totalItems = result?.meta?.total_items ?? 0
    totalPages = result?.meta?.total_pages ?? 1
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    // A logged-in user with a broken backend call still deserves a page,
    // just an empty one -- not a hard crash.
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My blogs</h1>
          <p className="text-sm text-muted-foreground">{totalItems} posts</p>
        </div>
        <Button render={<Link href="/editor/new" />}>
          <PenSquareIcon />
          New post
        </Button>
      </header>

      <nav className="flex flex-wrap gap-1">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value || 'all'}
            variant={filter.value === status ? 'secondary' : 'ghost'}
            size="sm"
            render={<Link href={filter.value ? `/my-blogs?status=${filter.value}` : '/my-blogs'} />}
          >
            {filter.label}
          </Button>
        ))}
      </nav>

      {blogs.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Everything you write, published or still a draft, shows up here."
          action={(
            <Button render={<Link href="/editor/new" />}>
              <PenSquareIcon />
              Write your first post
            </Button>
          )}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {blogs.map((blog) => (
            <li key={blog.id}>
              <Card className="flex-row items-center justify-between gap-4 px-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/editor/${blog.id}`}
                      className="truncate font-medium text-foreground hover:underline"
                    >
                      {blog.title}
                    </Link>
                    <Badge variant={STATUS_BADGE_VARIANT[blog.status] ?? 'outline'}>
                      {blog.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {blog.published_at
                      ? new Date(blog.published_at).toLocaleDateString()
                      : 'Draft'}
                    {' · '}
                    {blog.like_count} {blog.like_count === 1 ? 'like' : 'likes'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="outline" size="sm" render={<Link href={`/editor/${blog.id}`} />}>
                    Edit
                  </Button>
                  <DeleteBlogButton blogId={blog.id} blogTitle={blog.title} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <PagePagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/my-blogs"
        extraParams={{ status }}
      />
    </section>
  )
}
