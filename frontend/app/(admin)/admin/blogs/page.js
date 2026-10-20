import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server-client'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/common/empty-state'
import { PagePagination } from '@/components/common/page-pagination'
import { DeleteBlogButton } from '@/components/blog/delete-blog-button'
import { deleteBlogAsAdmin } from '@/app/(admin)/admin/actions'
import { parsePage, PAGE_SIZES, toRange } from '@/lib/pagination'

export const metadata = { title: 'All blogs' }

const STATUS_BADGE_VARIANT = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export default async function AdminBlogsPage({ searchParams }) {
  await requireSuperAdmin()

  const params = await searchParams
  const page = parsePage(params.page)
  const pageSize = PAGE_SIZES.adminBlogs
  const { from, to } = toRange(page, pageSize)

  // Deliberately a direct Supabase read, not FastAPI -- the
  // blogs_select_all_admin RLS policy already grants a super_admin's own
  // authenticated session visibility into every blog regardless of status.
  const supabase = await createClient()
  const { data: blogs, count, error } = await supabase
    .from('blogs')
    .select(
      'id, title, slug, status, created_at, author:profiles!blogs_author_id_fkey ( username, full_name )',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)

  const totalItems = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">All blogs</h1>
        <p className="text-sm text-muted-foreground">{totalItems} posts</p>
      </header>

      {blogs.length === 0 ? (
        <EmptyState title="No posts found" description="Nothing has been written yet." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="max-w-64 truncate font-medium text-foreground">
                    {blog.status === 'published' ? (
                      <Link href={`/blogs/${blog.slug}`} className="hover:underline">
                        {blog.title}
                      </Link>
                    ) : (
                      blog.title
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {blog.author?.full_name || blog.author?.username || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[blog.status] ?? 'outline'}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(new Date(blog.created_at))}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteBlogButton
                      blogId={blog.id}
                      blogTitle={blog.title}
                      deleteAction={deleteBlogAsAdmin}
                      extraWarning=", regardless of who wrote it"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PagePagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/blogs"
        extraParams={{}}
      />
    </section>
  )
}
