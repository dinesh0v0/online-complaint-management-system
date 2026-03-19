import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'ocms-theme-mode'

function getSystemTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'system'
    }

    return window.localStorage.getItem(STORAGE_KEY) || 'system'
  })
  const [resolvedTheme, setResolvedTheme] = useState(getSystemTheme)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const nextTheme = mode === 'system' ? getSystemTheme() : mode
      const root = document.documentElement

      root.classList.toggle('dark', nextTheme === 'dark')
      root.dataset.theme = nextTheme
      root.dataset.themeMode = mode
      setResolvedTheme(nextTheme)
      window.localStorage.setItem(STORAGE_KEY, mode)
    }

    applyTheme()
    mediaQuery.addEventListener('change', applyTheme)

    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      resolvedTheme,
    }),
    [mode, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.')
  }

  return context
}
