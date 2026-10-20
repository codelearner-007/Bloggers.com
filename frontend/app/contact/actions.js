'use server'

import { apiSend } from '@/lib/api/fastapi-client'

// Public endpoint, no auth required.
export async function submitContactMessage({ name, email, message }) {
  return apiSend('/api/v1/contact', {
    method: 'POST',
    body: { name, email, message },
    requireAuth: false,
  })
}
