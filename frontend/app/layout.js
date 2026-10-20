import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

const geistSans = Geist({
  // Named --font-sans (not --font-geist-sans) on purpose: globals.css's
  // @theme block declares `--font-sans: var(--font-sans)`, which re-exposes
  // whatever the cascade sets under that exact name as Tailwind's font-sans
  // utility. Matching the name here is what wires the two together.
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Bloggers.com', template: '%s | Bloggers.com' },
  description: 'A community blogging platform.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* suppressHydrationWarning guards against browser extensions (e.g. ColorZilla)
          injecting attributes like cz-shortcut-listen into <body> before hydration. */}
      <body
        suppressHydrationWarning
        className="flex min-h-dvh flex-col bg-background text-foreground antialiased"
      >
        {/* Render providers as deep as possible -- wrap {children}, not <html>. */}
        <Providers>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
