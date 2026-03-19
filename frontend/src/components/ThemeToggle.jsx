import { Laptop, Moon, Sun } from 'lucide-react'

import { useTheme } from '../context/ThemeContext'
import { THEME_OPTIONS } from '../lib/constants'
import { cn } from '../lib/utils'

const icons = {
  light: Sun,
  dark: Moon,
  system: Laptop,
}

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <div className="inline-flex rounded-full border border-line/70 bg-surface/80 p-1 shadow-panel backdrop-blur">
      {THEME_OPTIONS.map((option) => {
        const Icon = icons[option.value]
        const active = mode === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition',
              active
                ? 'bg-accent text-white shadow'
                : 'text-muted hover:bg-white/60 hover:text-ink dark:hover:bg-white/10',
            )}
          >
            <Icon size={14} />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
