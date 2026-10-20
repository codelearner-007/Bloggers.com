import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-client'

/**
 * WHICH CALL TO USE, AND WHY
 *
 * getSession()  - reads cookies WITHOUT revalidating them. Cookies are
 *                 attacker-controllable, so this is NEVER an authorization
 *                 decision in server code. Its ONLY legitimate server-side use
 *                 is lifting the raw access_token to FORWARD to FastAPI, which
 *                 independently re-verifies the signature against the JWKS.
 *
 * getClaims()   - decodes the JWT and, for an asymmetric (ES256) project,
 *                 verifies the signature locally against the project's
 *                 published public keys on every call. No network round trip.
 *                 This is the call to make an authorization decision on.
 *
 * getUser()     - also trustworthy, but costs a network round trip to the Auth
 *                 server on every call. Use it only if you are still on a
 *                 legacy HS256 project where getClaims() has to fall back to a
 *                 network call anyway, or if you need fields that are not in
 *                 the token.
 *
 * TRAP: when there is no session, getClaims() returns { data: null, error: null }
 * -- BOTH null. Guard with `if (!data?.claims)`, never `if (error)`.
 *
 * TRAP: the id is claims.sub, NOT claims.id. Writing `user.id` yields undefined
 * and silently inserts NULL author ids.
 */

// React-cached so every call in a request re-uses the first local signature
// verification instead of re-decoding the JWT. Returns the claims object, or
// null when there is no session -- see the TRAP above.
export const getClaims = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return data?.claims ?? null
})

export const getSessionUser = cache(async () => {
  const claims = await getClaims()
  if (!claims) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', claims.sub)
    .single()

  return { id: claims.sub, email: claims.email ?? null, profile: profile ?? null }
})

/** Raw token, for forwarding to FastAPI only. Never an authorization decision. */
export const getAccessToken = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token ?? null
})

export const requireUser = cache(async () => {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return user
})

/**
 * Re-reads the role from the database rather than trusting a JWT claim.
 * A claim is stale for up to jwt_expiry (default 3600s) after a demotion;
 * the table is correct on the next statement.
 */
export const requireSuperAdmin = cache(async () => {
  const claims = await getClaims()
  if (!claims) redirect('/login')

  // Column privileges hide `role` from the browser roles, so ask the database
  // through the guarded RPC path instead of selecting the column.
  const supabase = await createClient()
  const { data: isAdmin, error } = await supabase.rpc('is_current_user_super_admin')
  if (error || isAdmin !== true) redirect('/')

  return { id: claims.sub }
})
