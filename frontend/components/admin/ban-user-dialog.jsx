'use client'

import { useState, useTransition } from 'react'
import { BanIcon, ShieldCheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { banUser, unbanUser } from '@/app/(admin)/admin/actions'

export function BanUserDialog({ userId, userName, isBanned }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Unbanning restores access rather than revoking it, so it does not need
  // the same confirm-first friction that banning does.
  function handleUnban() {
    startTransition(async () => {
      try {
        await unbanUser(userId)
        toast.success(`${userName} is unbanned.`)
      } catch (error) {
        toast.error(error.message || 'Could not unban this user.')
      }
    })
  }

  function confirmBan() {
    startTransition(async () => {
      try {
        await banUser(userId)
        toast.success(`${userName} is banned.`)
        setOpen(false)
      } catch (error) {
        toast.error(error.message || 'Could not ban this user.')
      }
    })
  }

  if (isBanned) {
    return (
      <Button variant="outline" size="sm" onClick={handleUnban} disabled={isPending}>
        <ShieldCheckIcon />
        Unban
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <BanIcon />
        Ban
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ban {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This immediately ends all of their active sessions and blocks sign-in. You
            can unban them again at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={confirmBan}>
            {isPending ? 'Banning…' : 'Ban user'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
