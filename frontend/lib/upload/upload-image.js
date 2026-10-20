'use client'

import { requestUploadUrl, commitUpload } from '@/app/(app)/editor/actions'

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
])
const MAX_BYTES = 5 * 1024 * 1024
export const ALLOWED_TYPES_ACCEPT = [...ALLOWED_TYPES].join(',')

export async function uploadImage(file, { kind }) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, AVIF and GIF images are supported.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Images must be 5 MB or smaller.')
  }

  const ticket = await requestUploadUrl({
    kind,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  })

  // The token in the query string is the ENTIRE credential. No apikey header,
  // no Authorization header. The token bakes in the object key and the upsert
  // flag at signing time, so the browser cannot redirect this write.
  const response = await fetch(ticket.signed_url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  if (!response.ok) {
    throw new Error('Upload failed. Please try again.')
  }

  await commitUpload(ticket.attachment_id)

  return { attachmentId: ticket.attachment_id, publicUrl: ticket.public_url }
}
