'use client'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

function ThemeChanger() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile Theme Button (shows below 640px) */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-md transition-all hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:bg-zinc-900"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-basket-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
        </Button>
      </div>

      {/* Desktop Theme Switch (shows above 640px) */}
      <div className="fixed bottom-6 right-4 z-40 hidden items-center gap-2 sm:flex">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 p-2 shadow-sm backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/80">
          <Sun className="h-3.5 w-3.5 text-basket-400" />
          <Switch id="theme-toggle" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          <Moon className="h-3.5 w-3.5 text-zinc-500" />
          <Label htmlFor="theme-toggle" className="sr-only">
            Toggle theme
          </Label>
        </div>
      </div>
    </>
  )
}

export default ThemeChanger
