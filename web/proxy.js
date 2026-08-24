import { updateSession } from '@/lib/supabase/proxy-client'

export async function proxy(request) {
  return await updateSession(request)
}

export const config = {
  // Without a matcher, proxy runs on _next/static, _next/image and public/
  // too, and an auth redirect will block your CSS and JS from loading.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)',
  ],
}
