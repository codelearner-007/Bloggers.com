import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPublishedBlogBySlug } from '@/lib/data/blogs'
import { createAnonClient } from '@/lib/supabase/anon-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LikeButton } from '@/components/blog/like-button'

export const revalidate = 300

export async function generateStaticParams() {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  return (data ?? []).map((row) => ({ slug: row.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const blog = await getPublishedBlogBySlug(slug)
  if (!blog) return {}

  return {
    title: blog.title,
    description: blog.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      title: blog.title,
      description: blog.excerpt ?? undefined,
      publishedTime: blog.published_at ?? undefined,
      authors: blog.author?.full_name ? [blog.author.full_name] : undefined,
      images: blog.cover_url ? [blog.cover_url] : undefined,
    },
  }
}

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params

  // A draft, an archived post, and someone else's post are all indistinguishable
  // from "does not exist" here -- that is the RLS policy working as intended,
  // not a bug to work around.
  const blog = await getPublishedBlogBySlug(slug)
  if (!blog) notFound()

  const author = blog.author
  const publishedLabel = formatDate(blog.published_at)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <article>
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {author && (
              <span className="font-medium text-foreground">
                {author.full_name || author.username}
              </span>
            )}
            {publishedLabel && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={blog.published_at}>{publishedLabel}</time>
              </>
            )}
            {blog.reading_minutes != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{blog.reading_minutes} min read</span>
              </>
            )}
          </div>
        </header>

        {blog.cover_url && (
          <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={blog.cover_url}
              alt={blog.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose prose-neutral dark:prose-invert mt-8 max-w-none"
          // FastAPI runs every content_html write through sanitize_blog_html
          // (nh3) before it ever reaches Postgres -- the browser has no write
          // grant on this table at all, so this is the only sanitized value
          // that can ever land here.
          dangerouslySetInnerHTML={{ __html: blog.content_html }}
        />
      </article>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        {author && (
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={author.avatar_url ?? undefined} alt={author.full_name ?? author.username} />
              <AvatarFallback>
                {(author.full_name || author.username || '?').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{author.full_name || author.username}</span>
              {author.bio && <p className="max-w-md text-sm text-muted-foreground">{author.bio}</p>}
            </div>
          </div>
        )}

        <LikeButton blogId={blog.id} initialCount={blog.like_count} />
      </div>
    </div>
  )
}
