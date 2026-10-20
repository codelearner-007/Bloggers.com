import { requireSuperAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server-client'
import { UsersTable } from '@/components/admin/users-table'
import { PagePagination } from '@/components/common/page-pagination'
import { SearchInput } from '@/components/common/search-input'
import { parsePage, PAGE_SIZES } from '@/lib/pagination'

export const metadata = { title: 'Users' }

export default async function AdminUsersPage({ searchParams }) {
  await requireSuperAdmin()

  const params = await searchParams          // Promise in Next 16
  const page = parsePage(params.page)
  const query = (params.q ?? '').trim()

  const supabase = await createClient()
  const { data: rows, error } = await supabase.rpc('admin_list_users', {
    search_text: query || null,
    page_number: page,
    page_size: PAGE_SIZES.adminUsers,
  })

  if (error) throw new Error(error.message)

  const totalItems = rows?.[0]?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(Number(totalItems) / PAGE_SIZES.adminUsers))

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">{totalItems} accounts</p>
        </div>
        <SearchInput defaultValue={query} placeholder="Search name or email" />
      </header>

      <UsersTable users={rows ?? []} />

      <PagePagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/users"
        extraParams={{ q: query }}
      />
    </section>
  )
}
