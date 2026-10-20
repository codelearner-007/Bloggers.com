import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth/session'

const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/blogs', label: 'Blogs' },
]

// This layout gates the shell's UX only -- every page under it calls
// requireSuperAdmin() again on its own (see admin/users/page.js), because a
// layout that merely wraps a page does not stop that page's own data fetch
// from running if Next ever renders it in isolation (parallel routes,
// partial prerendering). Belt and suspenders, not redundancy.
export default async function AdminLayout({ children }) {
  await requireSuperAdmin()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:gap-8">
      <aside className="shrink-0 sm:w-48">
        <nav className="flex gap-1 overflow-x-auto sm:flex-col sm:gap-0.5">
          {ADMIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
