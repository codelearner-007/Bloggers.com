export const PAGE_SIZES = {
  blogs: 12,
  myBlogs: 12,
  adminUsers: 25,
  adminBlogs: 25,
}

export function parsePage(raw) {
  const parsed = Number.parseInt(raw ?? '1', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

/** supabase-js .range() is 0-based AND INCLUSIVE of both bounds. */
export function toRange(page, pageSize) {
  const from = (page - 1) * pageSize
  return { from, to: from + pageSize - 1 }
}

export function buildPageHref(basePath, extraParams, page) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) params.set(key, String(value))
  }
  if (page > 1) params.set('page', String(page))
  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

/** [1, '…', 4, 5, 6, '…', 20] */
export function buildPageRange(currentPage, totalPages, siblings = 1) {
  const range = []
  const push = (value) => {
    if (range[range.length - 1] !== value) range.push(value)
  }

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages
    const isNear = Math.abs(page - currentPage) <= siblings
    if (isEdge || isNear) push(page)
    else push('ellipsis')
  }
  return range
}
