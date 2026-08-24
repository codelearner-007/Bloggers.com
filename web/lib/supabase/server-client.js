import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create a NEW client on every call. Never hoist this into a module-level
// variable: on Vercel Fluid compute one instance would be shared across
// concurrent requests and cross-contaminate sessions.
//
// Reading cookies() opts the route into DYNAMIC rendering. Use anon-client.js
// for anything that needs ISR.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // Second argument is the cache headers. A Server Component cannot set
        // response headers, so it is intentionally ignored here -- proxy.js
        // applies them on every request instead.
        setAll(cookiesToSet, _headers) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component. Safe to ignore, because proxy.js
            // refreshes the session on every request.
          }
        },
      },
    }
  )
}
