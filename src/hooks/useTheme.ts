// ============================================================
// G003 主题切换（v0.20.0-alpha）
// 三档：light / dark / system
// localStorage key: g003-theme
// ============================================================

import { useEffect, useState, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
const STORAGE_KEY = 'g003-theme'
const VALID: ThemeMode[] = ['light', 'dark', 'system']

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function readStored(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v && (VALID as string[]).includes(v)) return v as ThemeMode
  return 'system'
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(readStored)
  const [resolved, setResolved] = useState<'light' | 'dark'>(
    () => resolveTheme(readStored())
  )

  // 应用主题到 data-theme
  useEffect(() => {
    const next = resolveTheme(mode)
    setResolved(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  // 跟随系统模式变化
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const next = mq.matches ? 'dark' : 'light'
      setResolved(next)
      document.documentElement.setAttribute('data-theme', next)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const cycle = useCallback(() => {
    setMode((prev) => {
      const idx = VALID.indexOf(prev)
      return VALID[(idx + 1) % VALID.length]
    })
  }, [])

  return { mode, resolved, setMode, cycle }
}
