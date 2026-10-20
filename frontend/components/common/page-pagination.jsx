import Link from 'next/link'
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { buildPageHref, buildPageRange } from '@/lib/pagination'

// Server Component: no state, no useSearchParams (which fails the production
// build on a prerendered route with "Missing Suspense boundary with
// useSearchParams" while working fine in `next dev`).
export function PagePagination({ currentPage, totalPages, basePath, extraParams }) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(currentPage, totalPages)
  const href = (page) => buildPageHref(basePath, extraParams, page)

  return (
    <div className="flex flex-col items-center gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {currentPage > 1 ? (
              <PaginationPrevious render={<Link href={href(currentPage - 1)} />} />
            ) : (
              <PaginationPrevious
                aria-disabled="true"
                className="pointer-events-none text-muted-foreground opacity-50"
              />
            )}
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={page === 'ellipsis' ? `gap-${index}` : page}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink render={<Link href={href(page)} />} isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            {currentPage < totalPages ? (
              <PaginationNext render={<Link href={href(currentPage + 1)} />} />
            ) : (
              <PaginationNext
                aria-disabled="true"
                className="pointer-events-none text-muted-foreground opacity-50"
              />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Stays mounted so screen readers announce the change. */}
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  )
}
