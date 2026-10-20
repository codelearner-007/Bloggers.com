'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'

export function GoogleSignInButton({ next = '/' }) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  async function signIn() {
    setIsRedirecting(true)
    const supabase = createClient()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
      // Do NOT add access_type: 'offline' / prompt: 'consent'. Those exist to
      // obtain a Google provider_refresh_token for calling Google APIs on the
      // user's behalf. We never do that, and they force the consent screen on
      // every single login.
    })

    if (error) setIsRedirecting(false)
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signIn}
      disabled={isRedirecting}
      className="w-full border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {isRedirecting ? 'Redirecting to Google…' : 'Continue with Google'}
    </Button>
  )
}
