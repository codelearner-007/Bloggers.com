import { requireSuperAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server-client'
import { StatCard } from '@/components/admin/stat-card'
import { SignupsChart } from '@/components/admin/signups-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const metadata = { title: 'Admin dashboard' }

export default async function AdminDashboardPage() {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data: stats, error } = await supabase.rpc('admin_dashboard_stats')
  if (error) throw new Error(error.message)

  const topAuthors = stats?.top_authors ?? []
  const signupsPerDay = stats?.signups_per_day ?? []

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform activity at a glance.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value={stats?.total_users ?? 0} hint={`+${stats?.new_users_7d ?? 0} this week`} />
        <StatCard label="New users (30d)" value={stats?.new_users_30d ?? 0} />
        <StatCard label="Banned users" value={stats?.banned_users ?? 0} />
        <StatCard label="Pending contact" value={stats?.pending_contact ?? 0} />
        <StatCard label="Total blogs" value={stats?.total_blogs ?? 0} hint={`+${stats?.blogs_7d ?? 0} this week`} />
        <StatCard label="Published blogs" value={stats?.published_blogs ?? 0} />
        <StatCard label="Draft blogs" value={stats?.draft_blogs ?? 0} />
        <StatCard label="Total likes" value={stats?.total_likes ?? 0} />
      </div>

      <SignupsChart data={signupsPerDay} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Top authors</CardTitle>
        </CardHeader>
        <CardContent>
          {topAuthors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published blogs yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Published blogs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAuthors.map((author) => (
                  <TableRow key={author.username ?? author.full_name}>
                    <TableCell>
                      <span className="font-medium text-foreground">{author.full_name ?? author.username}</span>
                      {author.username ? (
                        <span className="ml-2 text-muted-foreground">@{author.username}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">{author.published_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
