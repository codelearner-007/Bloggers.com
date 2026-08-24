import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BlogCard } from '@/components/blog/blog-card'
import { listRecentPublishedBlogs } from '@/lib/data/blogs'

export const revalidate = 300

export default async function HomePage() {
  const blogs = await listRecentPublishedBlogs(6)

  return (
    <main className="mx-auto w-full max-w-6xl space-y-16 px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Read and write posts that matter to you.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Bloggers.com is a community blogging platform -- publish your own posts and discover
          what everyone else is writing.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link href="/blogs" />}>Browse posts</Button>
          <Button size="lg" variant="outline" render={<Link href="/editor/new" />}>
            Write a post
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-foreground">Recent posts</h2>
          <Button variant="ghost" render={<Link href="/blogs" />}>View all</Button>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No posts have been published yet.</p>
        )}
      </section>
    </main>
  )
}
