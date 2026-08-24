import 'server-only'

import { getAccessToken } from '@/lib/auth/session'

export class ApiError extends Error {
  constructor(status, body) {
    super((body && (body.detail || body.message)) || `Request failed (${status})`)
    this.status = status
    this.body = body
  }
}

/**
 * The one place a Server Action or Server Component reaches FastAPI from.
 * Forwards the caller's Supabase access_token as a Bearer token -- FastAPI
 * independently re-verifies it against the JWKS (see backend/app/core/security.py),
 * it is never trusted just because it arrived. This function never runs in
 * the browser: API_BASE_URL is intentionally NOT prefixed NEXT_PUBLIC_, so a
 * client component cannot call it directly, only through a Server Action.
 */
export async function apiSend(path, { method = 'GET', body, cache = 'no-store' } = {}) {
  const token = await getAccessToken()
  if (!token) throw new ApiError(401, { detail: 'Not signed in' })

  const response = await fetch(`${process.env.API_BASE_URL}${path}`, {
    method,
    cache,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(response.status, payload)
  }

  return payload
}
