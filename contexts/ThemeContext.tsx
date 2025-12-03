'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ThemeColors {
  primary: string
  primaryHover: string
  primaryGradient: string
  secondary: string
  secondaryHover: string
  secondaryGradient: string
  success: string
  successHover: string
  successGradient: string
  background: string
  cardBackground: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  border: string
  borderFocus: string
}

const defaultTheme: ThemeColors = {
  primary: 'blue-600',
  primaryHover: 'blue-700',
  primaryGradient: 'from-blue-600 to-indigo-600',
  secondary: 'purple-600',
  secondaryHover: 'purple-700',
  secondaryGradient: 'from-purple-600 to-pink-600',
  success: 'green-600',
  successHover: 'green-700',
  successGradient: 'from-green-600 to-emerald-600',
  background: 'from-blue-50 to-indigo-100',
  cardBackground: 'white',
  textPrimary: 'gray-900',
  textSecondary: 'gray-600',
  textTertiary: 'gray-500',
  border: 'gray-300',
  borderFocus: 'blue-500',
}

const ThemeContext = createContext<ThemeColors>(defaultTheme)

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
