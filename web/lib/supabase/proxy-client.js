import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/my-blogs', '/editor', '/admin']

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
          // Cache-Control / Expires / Pragma. Without these a CDN can cache one
          // user's response and serve their session to a different user.
          for (const [key, value] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, value)
          }
        },
      },
    }
  )

  // Do NOT run any code between createServerClient() and getClaims().
  // Supabase's own source comments warn that a mistake here makes users appear
  // to be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims ?? null

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !claims) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // You MUST return supabaseResponse as-is. If you build a different response,
  // copy the cookies onto it first, or the browser and server sessions desync
  // and the session dies early.
  return supabaseResponse
}
