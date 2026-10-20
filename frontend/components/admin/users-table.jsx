import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'
import { RoleSelect } from '@/components/admin/role-select'
import { BanUserDialog } from '@/components/admin/ban-user-dialog'

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

const RELATIVE_UNITS = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
]

// Hand-rolled instead of a dependency -- this is the only relative-time spot
// in the whole app, and Intl.RelativeTimeFormat already does the pluralizing.
function timeAgo(isoString) {
  if (!isoString) return 'Never'

  const seconds = Math.round((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return 'Just now'

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    const value = Math.floor(seconds / unitSeconds)
    if (value >= 1) return formatter.format(-value, unit)
  }
  return 'Just now'
}

function initialsOf(user) {
  const source = user.full_name || user.username || user.email || '?'
  return source.trim().slice(0, 2).toUpperCase()
}

export function UsersTable({ users }) {
  if (users.length === 0) {
    return <EmptyState title="No users found" description="Try a different search." />
  }

  return (
    <div className="rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Blogs</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last sign-in</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar size="sm">
                  <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                  <AvatarFallback>{initialsOf(user)}</AvatarFallback>
                </Avatar>
              </TableCell>

              <TableCell>
                <div className="font-medium text-foreground">{user.full_name || 'Unnamed'}</div>
                <div className="text-xs text-muted-foreground">@{user.username || 'unknown'}</div>
              </TableCell>

              <TableCell className="text-muted-foreground">{user.email}</TableCell>

              <TableCell>
                <div className="capitalize text-foreground">{user.auth_provider}</div>
                <div className="max-w-32 truncate text-xs text-muted-foreground">
                  {user.provider_user_id}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                  {user.role === 'super_admin' ? 'Super admin' : 'User'}
                </Badge>
              </TableCell>

              <TableCell className="text-foreground">
                {user.published_blog_count}
                <span className="text-muted-foreground"> / {user.blog_count}</span>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {dateFormatter.format(new Date(user.created_at))}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {timeAgo(user.last_sign_in_at)}
              </TableCell>

              <TableCell>
                {user.is_banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : user.email_confirmed ? (
                  <Badge variant="outline">Verified</Badge>
                ) : (
                  <Badge variant="secondary">Unverified</Badge>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <RoleSelect userId={user.id} currentRole={user.role} />
                  <BanUserDialog
                    userId={user.id}
                    userName={user.full_name || user.username || user.email}
                    isBanned={user.is_banned}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
