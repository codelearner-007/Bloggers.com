'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const subscribeNever = () => () => {}

// next-themes writes the class before hydration, but reading `theme` on the
// very first client render would still mismatch the server-rendered icon.
// useSyncExternalStore gives a server/client snapshot split without the
// effect+setState-on-mount pattern react-hooks/set-state-in-effect flags.
function useHasMounted() {
  return useSyncExternalStore(subscribeNever, () => true, () => false)
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useHasMounted()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Toggle theme" />}>
        {mounted && theme === 'dark' ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
