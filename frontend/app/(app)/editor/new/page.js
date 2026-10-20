import { requireUser } from '@/lib/auth/session'
import { BlogEditor } from '@/components/blog/blog-editor'

export const metadata = { title: 'New post' }

export default async function NewBlogPage() {
  await requireUser()
  return <BlogEditor initialBlog={null} />
}
