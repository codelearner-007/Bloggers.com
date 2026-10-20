import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Sign-in failed' }

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Sign-in didn&apos;t go through</h1>
      <p className="text-muted-foreground">
        The link may have expired, or the request was cancelled. Try signing in again.
      </p>
      <Button asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </main>
  )
}
