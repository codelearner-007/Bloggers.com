'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { promoteUser, demoteUser } from '@/app/(admin)/admin/actions'

export function RoleSelect({ userId, currentRole }) {
  const [isPending, startTransition] = useTransition()

  function handleChange(role) {
    if (role === currentRole) return

    startTransition(async () => {
      try {
        if (role === 'super_admin') {
          await promoteUser(userId)
          toast.success('Promoted to super admin.')
        } else {
          await demoteUser(userId)
          toast.success('Demoted to user.')
        }
      } catch (error) {
        // The single-super-admin unique index throws a 409 on promote.
        const message = error.status === 409
          ? 'There is already a super admin.'
          : error.message || 'Could not update this role.'
        toast.error(message)
      }
    })
  }

  return (
    <Select value={currentRole} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="super_admin">Super admin</SelectItem>
      </SelectContent>
    </Select>
  )
}
