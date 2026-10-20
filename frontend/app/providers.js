'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem
                   disableTransitionOnChange>
      {children}
      <Toaster richColors closeButton />
    </ThemeProvider>
  )
}
