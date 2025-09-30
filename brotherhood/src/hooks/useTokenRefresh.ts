// 토큰 자동 갱신 관련 훅

import { useEffect, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services'
import { useAuthStore } from '@/stores'
import { QUERY_KEYS } from '@/providers'

// 토큰 갱신 뮤테이션
export const useTokenRefresh = () => {
  const { refreshToken, login, logout } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (token: string) => authApi.refreshToken({ refreshToken: token }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // 새 토큰으로 로그인 상태 업데이트
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          login(
            {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            },
            currentUser
          )
        }
      }
    },
    onError: (error) => {
      console.error('Token refresh failed:', error)
      // 토큰 갱신 실패시 로그아웃
      logout()
      queryClient.clear()
    },
  })
}

// 자동 토큰 갱신 훅
export const useAutoTokenRefresh = () => {
  const { refreshToken, isAuthenticated } = useAuthStore()
  const refreshMutation = useTokenRefresh()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 토큰 갱신 실행
  const refreshTokens = useCallback(() => {
    if (refreshToken && !refreshMutation.isPending) {
      refreshMutation.mutate(refreshToken)
    }
  }, [refreshToken, refreshMutation])
  
  // 자동 갱신 설정
  useEffect(() => {
    if (!isAuthenticated || !refreshToken) {
      // 인증되지 않았거나 리프레시 토큰이 없으면 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    
    // 10분마다 토큰 갱신 시도
    intervalRef.current = setInterval(() => {
      refreshTokens()
    }, 10 * 60 * 1000) // 10분
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated, refreshToken, refreshTokens])
  
  // 컴포넌트 언마운트시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  return {
    refreshTokens,
    isRefreshing: refreshMutation.isPending,
    refreshError: refreshMutation.error,
  }
}

// 토큰 만료 시간 기반 갱신 훅
export const useTokenExpiryRefresh = () => {
  const { accessToken, refreshToken, isAuthenticated } = useAuthStore()
  const refreshMutation = useTokenRefresh()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // JWT 토큰 디코딩 (간단한 버전)
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Failed to decode JWT:', error)
      return null
    }
  }
  
  // 토큰 만료 시간 계산
  const getTokenExpiry = (token: string) => {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return null
    
    return new Date(decoded.exp * 1000)
  }
  
  // 토큰 갱신 스케줄링
  const scheduleTokenRefresh = useCallback(() => {
    if (!accessToken || !refreshToken || !isAuthenticated) return
    
    const expiryTime = getTokenExpiry(accessToken)
    if (!expiryTime) return
    
    const now = new Date()
    const timeUntilExpiry = expiryTime.getTime() - now.getTime()
    
    // 만료 5분 전에 갱신
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000)
    
    if (refreshTime > 0) {
      // 기존 타이머 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // 새 타이머 설정
      timeoutRef.current = setTimeout(() => {
        refreshMutation.mutate(refreshToken)
      }, refreshTime)
    } else {
      // 이미 만료되었거나 곧 만료될 예정이면 즉시 갱신
      refreshMutation.mutate(refreshToken)
    }
  }, [accessToken, refreshToken, isAuthenticated, refreshMutation])
  
  // 토큰 변경시 갱신 스케줄링
  useEffect(() => {
    scheduleTokenRefresh()
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [scheduleTokenRefresh])
  
  // 컴포넌트 언마운트시 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return {
    isRefreshing: refreshMutation.isPending,
    refreshError: refreshMutation.error,
  }
}

// 수동 토큰 갱신 훅
export const useManualTokenRefresh = () => {
  const { refreshToken } = useAuthStore()
  const refreshMutation = useTokenRefresh()
  
  const refreshTokens = useCallback(() => {
    if (refreshToken) {
      refreshMutation.mutate(refreshToken)
    }
  }, [refreshToken, refreshMutation])
  
  return {
    refreshTokens,
    isRefreshing: refreshMutation.isPending,
    refreshError: refreshMutation.error,
    isSuccess: refreshMutation.isSuccess,
  }
}
