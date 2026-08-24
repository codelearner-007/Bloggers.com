'use server'

import { apiSend, ApiError } from '@/lib/api/fastapi-client'

/** Both directions are idempotent on the FastAPI side, so a double-click or a
 * retried request never double-counts. */
export async function toggleLike(blogId, isCurrentlyLiked) {
  try {
    const result = await apiSend(`/api/v1/blogs/${blogId}/like`, {
      method: isCurrentlyLiked ? 'DELETE' : 'POST',
    })
    return result.like_count
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new Error('Sign in to like this post')
    }
    throw error
  }
}
