'use client'

import { useState, useTransition } from 'react'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteBlog } from '@/app/(app)/my-blogs/actions'

export function DeleteBlogButton({ blogId, blogTitle }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteBlog(blogId)
        toast.success('Post deleted.')
        setOpen(false)
      } catch (error) {
        toast.error(error.message || 'Could not delete this post.')
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Delete post" />}
      >
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{blogTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the post and its images. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={confirmDelete}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
