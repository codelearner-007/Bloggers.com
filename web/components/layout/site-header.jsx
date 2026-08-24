import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { getSessionUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server-client'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/contact', label: 'Contact' },
]

// A dedicated async server component, NOT awaited at the top of the layout --
// this is what lets the header shell (and everything below it) stream
// immediately instead of blocking the whole page behind a session lookup.
async function HeaderAuthSlot() {
  const user = await getSessionUser()
  if (!user) return <GoogleSignInButton next="/" />

  const supabase = await createClient()
  const { data: isSuperAdmin } = await supabase.rpc('is_current_user_super_admin')

  return <UserMenu user={user} isSuperAdmin={isSuperAdmin === true} />
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
          Bloggers<span className="text-primary">.com</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" render={<Link href={link.href} />}>
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <HeaderAuthSlot />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
