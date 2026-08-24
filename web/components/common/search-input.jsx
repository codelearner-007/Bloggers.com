'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'

const DEBOUNCE_MS = 350

export function SearchInput({ defaultValue = '', placeholder = 'Search' }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  function handleChange(event) {
    const nextValue = event.target.value
    setValue(nextValue)

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextValue.trim()) {
        params.set('q', nextValue.trim())
      } else {
        params.delete('q')
      }
      // Any new search starts back at page 1 -- a stale page number past the
      // end of the new result set would otherwise render an empty page.
      params.delete('page')

      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    }, DEBOUNCE_MS)
  }

  return (
    <Input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="max-w-sm"
      aria-label={placeholder}
    />
  )
}
