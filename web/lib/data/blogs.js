import { createAnonClient } from '@/lib/supabase/anon-client'
import { PAGE_SIZES, toRange } from '@/lib/pagination'

const LIST_COLUMNS = `
  id, slug, title, excerpt, cover_url, published_at, like_count, reading_minutes,
  author:profiles!blogs_author_id_fkey ( username, full_name, avatar_url )
`

export async function listPublishedBlogs({ page, query }) {
  const pageSize = PAGE_SIZES.blogs
  const { from, to } = toRange(page, pageSize)
  const supabase = createAnonClient()

  let request = supabase
    .from('blogs')
    .select(LIST_COLUMNS, { count: 'exact' })
    .eq('status', 'published')

  if (query) {
    // A real GIN tsvector index, not .filter() over the whole downloaded table.
    request = request.textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english',
    })
  }

  const { data, count, error } = await request
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to)

  // PGRST103 (HTTP 416) is returned when the range starts past the last row --
  // it is an ERROR, not an empty array. A stale bookmark or a hand-typed
  // ?page=999 would otherwise crash the Server Component.
  if (error && error.code === 'PGRST103') {
    const { count: total } = await supabase
      .from('blogs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
    return { blogs: [], totalItems: total ?? 0, totalPages: Math.max(1, Math.ceil((total ?? 0) / pageSize)) }
  }
  if (error) throw new Error(error.message)

  return {
    blogs: data ?? [],
    totalItems: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  }
}

const DETAIL_COLUMNS = `
  id, slug, title, excerpt, content_html, cover_url, status, like_count,
  reading_minutes, published_at, created_at,
  author:profiles!blogs_author_id_fkey ( id, username, full_name, avatar_url, bio )
`

/** Public read. RLS's blogs_select_published policy hides drafts and other
 * users' unpublished posts -- a non-published slug simply returns null here,
 * which the caller turns into notFound(). That is correct behaviour: an RLS
 * denial and "the row does not exist" are indistinguishable by design. */
export async function getPublishedBlogBySlug(slug) {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('blogs')
    .select(DETAIL_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function listRecentPublishedBlogs(limit = 6) {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('blogs')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}
