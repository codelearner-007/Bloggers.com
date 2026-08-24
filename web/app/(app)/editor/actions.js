'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiSend } from '@/lib/api/fastapi-client'

/** Step 1 of the direct-to-Storage upload: mint a signed PUT url + pending
 * Attachment row. Imported by lib/upload/upload-image.js by this exact name. */
export async function requestUploadUrl({ kind, file_name, mime_type, size_bytes }) {
  return apiSend('/api/v1/media/upload-url', {
    method: 'POST',
    body: { kind, file_name, mime_type, size_bytes },
  })
}

/** Step 2: tell FastAPI the browser's PUT actually landed, so it can verify
 * the real object size and flip the attachment to COMMITTED. */
export async function commitUpload(attachmentId) {
  return apiSend(`/api/v1/media/${attachmentId}/commit`, { method: 'POST' })
}

export async function saveBlog({ id, title, excerpt, content_html, content_json, cover_attachment_id, status }) {
  const isCreate = !id
  const body = { title, excerpt, content_html, content_json, cover_attachment_id, status }

  const result = isCreate
    ? await apiSend('/api/v1/blogs', { method: 'POST', body })
    : await apiSend(`/api/v1/blogs/${id}`, { method: 'PATCH', body })

  revalidatePath('/my-blogs')
  revalidatePath(`/blogs/${result.slug}`)

  // Publishing always takes the author to the live post, whether this was
  // the post's first save or the tenth.
  if (result.status === 'published') {
    redirect(`/blogs/${result.slug}`)
  }

  // The very first save of a brand-new draft needs to land somewhere real --
  // /editor/new has nothing to keep re-loading. An update-in-place (the
  // author was already on /editor/{id}) stays put so autosave-style edits
  // don't yank focus away from the form.
  if (isCreate) {
    redirect('/my-blogs')
  }

  return result
}
