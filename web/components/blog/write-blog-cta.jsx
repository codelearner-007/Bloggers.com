import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function WriteBlogCta() {
  return (
    <Card className="flex flex-col items-center gap-4 border border-border bg-muted/30 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Have something to say?</h2>
        <p className="text-sm text-muted-foreground">
          Write a post and share it with the Bloggers.com community.
        </p>
      </div>
      <Button render={<Link href="/editor/new" />}>Write a post</Button>
    </Card>
  )
}
