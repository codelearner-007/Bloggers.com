import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Bloggers.com</p>
        <nav className="flex items-center gap-4">
          <Link href="/blogs" className="hover:text-foreground">Blogs</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  )
}
