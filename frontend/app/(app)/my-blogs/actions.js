'use server'

import { revalidatePath } from 'next/cache'
import { apiSend } from '@/lib/api/fastapi-client'

// ApiError deliberately propagates uncaught -- the Client Component that
// calls this must catch it and surface it via sonner, never let it crash.
export async function deleteBlog(id) {
  await apiSend(`/api/v1/blogs/${id}`, { method: 'DELETE' })
  revalidatePath('/my-blogs')
}
