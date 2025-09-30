'use client'

// 인증 상태 관리 Provider

import React, { createContext, useContext, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores'
import { useCurrentUser, useSessionValidation, useAutoTokenRefresh, useSessionExpiry } from '@/hooks'
import type { UserInfo } from '@/types'

interface AuthContextType {
  // 인증 상태
  isAuthenticated: boolean
  user: UserInfo | null
  isLoading: boolean
  
  // 권한 확인
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  
  // 세션 관리
  isSessionValid: boolean
  sessionExpiresAt: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    isAuthenticated,
    user,
    isLoading,
    hasRole,
    hasAnyRole,
  } = useAuthStore()
  
  // 현재 사용자 정보 조회
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  
  // 세션 검증
  const { data: sessionData, isLoading: sessionLoading } = useSessionValidation()
  
  // 자동 토큰 갱신
  const { isRefreshing: isTokenRefreshing } = useAutoTokenRefresh()
  
  // 세션 만료 처리
  const { extendSession } = useSessionExpiry({
    warningTime: 5, // 5분 전 경고
    logoutTime: 0, // 즉시 로그아웃
    showWarning: true,
  })
  
  // 세션 만료 감지 및 자동 로그아웃
  useEffect(() => {
    if (!isAuthenticated || !sessionData) return
    
    const { valid, expiresAt } = sessionData
    
    if (!valid) {
      // 세션이 유효하지 않으면 로그아웃
      console.warn('Session is invalid, logging out...')
      useAuthStore.getState().logout()
      return
    }
    
    if (expiresAt) {
      const expiryTime = new Date(expiresAt).getTime()
      const currentTime = Date.now()
      const timeUntilExpiry = expiryTime - currentTime
      
      // 5분 전에 경고 표시
      const warningTime = 5 * 60 * 1000 // 5분
      
      if (timeUntilExpiry > 0 && timeUntilExpiry <= warningTime) {
        // 세션 만료 경고 (실제 구현에서는 토스트나 모달 표시)
        console.warn(`Session will expire in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`)
      }
      
      // 만료 시간에 자동 로그아웃
      const timeoutId = setTimeout(() => {
        console.warn('Session expired, logging out...')
        useAuthStore.getState().logout()
      }, timeUntilExpiry)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated, sessionData])
  
  // 페이지 가시성 변경 감지 (탭 전환시 세션 연장)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // 페이지가 다시 보이면 세션 검증
        // React Query가 자동으로 쿼리를 다시 실행함
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAuthenticated])
  
  // 키보드 활동 감지 (사용자 활동시 세션 연장)
  useEffect(() => {
    if (!isAuthenticated) return
    
    let activityTimer: NodeJS.Timeout
    
    const resetActivityTimer = () => {
      clearTimeout(activityTimer)
      // 10분간 활동이 없으면 세션 검증
      activityTimer = setTimeout(() => {
        // React Query가 자동으로 쿼리를 다시 실행함
      }, 10 * 60 * 1000)
    }
    
    const handleActivity = () => {
      resetActivityTimer()
    }
    
    // 마우스, 키보드, 터치 이벤트 감지
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })
    
    resetActivityTimer()
    
    return () => {
      clearTimeout(activityTimer)
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [isAuthenticated])
  
  const contextValue: AuthContextType = {
    isAuthenticated,
    user: currentUser || null,
    isLoading: isLoading || userLoading || sessionLoading || isTokenRefreshing,
    hasRole,
    hasAnyRole,
    isSessionValid: sessionData?.valid ?? false,
    sessionExpiresAt: sessionData?.expiresAt ?? null,
  }
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// AuthContext 사용을 위한 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 인증 상태만 필요한 경우를 위한 간단한 훅
export function useAuthStatus() {
  const { isAuthenticated, isLoading } = useAuth()
  return { isAuthenticated, isLoading }
}

// 현재 사용자 정보만 필요한 경우를 위한 훅
export function useCurrentUserInfo() {
  const { user, isLoading } = useAuth()
  return { user, isLoading }
}

// 권한 확인만 필요한 경우를 위한 훅
export function useAuthPermissions() {
  const { hasRole, hasAnyRole } = useAuth()
  return { hasRole, hasAnyRole }
}
