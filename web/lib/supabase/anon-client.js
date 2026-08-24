import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Public reads only. No cookies, therefore no dynamic-rendering opt-in,
// therefore `export const revalidate` and generateStaticParams actually work.
// Queries run as the `anon` Postgres role and are filtered by
// blogs_select_published.
//
// This is also the ONLY client usable inside generateStaticParams(), which runs
// at build time where there is no request and cookies() would throw.
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
