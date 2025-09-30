'use client'

// Brotherhood 시스템 Provider 통합

import React from 'react'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'
import { ThemeProvider } from './ThemeProvider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

// 개별 Provider 재-익스포트
export { QueryProvider, QUERY_KEYS } from './QueryProvider'
export { AuthProvider, useAuth, useAuthStatus, useCurrentUserInfo, useAuthPermissions } from './AuthProvider'
export { ThemeProvider } from './ThemeProvider'
