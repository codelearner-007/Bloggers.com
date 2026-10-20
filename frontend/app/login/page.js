import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'

export const metadata = {
  title: 'Sign in',
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const next = params.next ?? '/'

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full bg-card text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to Bloggers.com to write and manage your posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton next={next} />
        </CardContent>
      </Card>
    </main>
  )
}
