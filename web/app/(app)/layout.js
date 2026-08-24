import { requireUser } from '@/lib/auth/session'

// Every route under this group needs a signed-in user (my-blogs, the
// editor). requireUser() redirects to /login itself, so there is nothing
// else to branch on here -- this group adds no chrome of its own, the root
// layout's header/footer already wrap {children}.
export default async function AppLayout({ children }) {
  await requireUser()
  return children
}
