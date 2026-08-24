'use server'

import { revalidatePath } from 'next/cache'
import { apiSend } from '@/lib/api/fastapi-client'

// Every function here lets ApiError propagate -- the calling Client
// Component is expected to catch it and toast() the message (e.g. a 409 from
// promoteUser means "there is already a super admin"). Swallowing it here
// would hide that detail from the admin taking the action.

export async function promoteUser(userId) {
  await apiSend(`/api/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { role: 'super_admin' },
  })
  revalidatePath('/admin/users')
  revalidatePath('/admin')
}

export async function demoteUser(userId) {
  await apiSend(`/api/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { role: 'user' },
  })
  revalidatePath('/admin/users')
  revalidatePath('/admin')
}

export async function banUser(userId) {
  await apiSend(`/api/v1/admin/users/${userId}/ban`, { method: 'POST' })
  revalidatePath('/admin/users')
  revalidatePath('/admin')
}

export async function unbanUser(userId) {
  await apiSend(`/api/v1/admin/users/${userId}/ban`, { method: 'DELETE' })
  revalidatePath('/admin/users')
  revalidatePath('/admin')
}

export async function deleteBlogAsAdmin(blogId) {
  await apiSend(`/api/v1/admin/blogs/${blogId}`, { method: 'DELETE' })
  revalidatePath('/admin/blogs')
  revalidatePath('/admin')
  revalidatePath('/blogs')
}

export async function markContactHandled(contactId, isHandled) {
  await apiSend(`/api/v1/admin/contact/${contactId}`, {
    method: 'PATCH',
    body: { is_handled: isHandled },
  })
  revalidatePath('/admin/contact')
  revalidatePath('/admin')
}
