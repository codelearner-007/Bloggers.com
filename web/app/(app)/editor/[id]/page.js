import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth/session'
import { apiSend, ApiError } from '@/lib/api/fastapi-client'
import { BlogEditor } from '@/components/blog/blog-editor'

export const metadata = { title: 'Edit post' }

export default async function EditBlogPage({ params }) {
  await requireUser()
  const { id } = await params

  // Always hydrated from the server on every load, never from client-side
  // router state -- this is the fix for the old app's "editor loses its
  // data on refresh" bug.
  let blog
  try {
    blog = await apiSend(`/api/v1/blogs/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  return <BlogEditor initialBlog={blog} />
}
