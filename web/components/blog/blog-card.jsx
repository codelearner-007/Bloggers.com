import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function formatPublishedDate(publishedAt) {
  if (!publishedAt) return null
  return new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function authorInitial(author) {
  const source = author?.full_name || author?.username || '?'
  return source.charAt(0).toUpperCase()
}

export function BlogCard({ blog }) {
  const authorName = blog.author?.full_name || blog.author?.username || 'Unknown author'
  const publishedDate = formatPublishedDate(blog.published_at)

  return (
    <Card size="sm" className="h-full">
      <Link href={`/blogs/${blog.slug}`} className="block">
        {blog.cover_url ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={blog.cover_url}
              alt={blog.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No cover image</span>
          </div>
        )}
      </Link>

      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">
          <Link href={`/blogs/${blog.slug}`} className="hover:text-primary">
            {blog.title}
          </Link>
        </CardTitle>
        {blog.excerpt ? (
          <CardDescription className="line-clamp-2">{blog.excerpt}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src={blog.author?.avatar_url ?? undefined} alt={authorName} />
          <AvatarFallback>{authorInitial(blog.author)}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">{authorName}</span>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{publishedDate ?? 'Unpublished'}</span>
        <div className="flex items-center gap-3">
          {typeof blog.reading_minutes === 'number' ? <span>{blog.reading_minutes} min read</span> : null}
          <span>{blog.like_count ?? 0} likes</span>
        </div>
      </CardFooter>
    </Card>
  )
}
