import { listPublishedBlogs } from '@/lib/data/blogs'
import { BlogCard } from '@/components/blog/blog-card'
import { EmptyState } from '@/components/common/empty-state'
import { PagePagination } from '@/components/common/page-pagination'

export async function BlogList({ page, query }) {
  const { blogs, totalPages } = await listPublishedBlogs({ page, query })

  if (blogs.length === 0) {
    return (
      <EmptyState
        title={query ? 'No posts match your search' : 'No posts yet'}
        description={query ? 'Try a different search term.' : 'Check back soon for new posts.'}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      <PagePagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/blogs"
        extraParams={{ q: query }}
      />
    </div>
  )
}
