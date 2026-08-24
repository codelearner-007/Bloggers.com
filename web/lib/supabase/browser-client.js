import { createBrowserClient } from '@supabase/ssr'

// createBrowserClient is already a singleton internally, so calling this from
// every client component is fine.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}
