'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toggleLike } from '@/app/blogs/[slug]/actions'

export function LikeButton({ blogId, initialCount }) {
  const [isLiked, setIsLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [isPending, setIsPending] = useState(false)

  // Whether THIS viewer already liked the post is per-viewer state that would
  // otherwise pin the whole cached page to one visitor -- fetched client-side
  // instead of threaded through the Server Component.
  useEffect(() => {
    let cancelled = false

    async function loadLikedState() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user || cancelled) return

      const { data } = await supabase
        .from('blog_likes')
        .select('blog_id')
        .eq('blog_id', blogId)
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (!cancelled && data) setIsLiked(true)
    }

    loadLikedState()
    return () => {
      cancelled = true
    }
  }, [blogId])

  async function handleClick() {
    if (isPending) return

    const nextLiked = !isLiked
    const previousCount = count

    setIsPending(true)
    setIsLiked(nextLiked)
    setCount((current) => current + (nextLiked ? 1 : -1))

    try {
      const serverCount = await toggleLike(blogId, isLiked)
      setCount(serverCount)
    } catch (error) {
      setIsLiked(!nextLiked)
      setCount(previousCount)
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isLiked}
      className="gap-2"
    >
      <Heart className={cn('size-4', isLiked && 'fill-primary text-primary')} />
      {count}
    </Button>
  )
}
