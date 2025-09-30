// 세션 만료 처리 및 자동 로그아웃 훅

import { useEffect, useCallback, useRef, useState } from 'react'
import { useAuthStore } from '@/stores'
import { useUIStore } from '@/stores'

interface SessionExpiryOptions {
  warningTime?: number // 경고 표시 시간 (분)
  logoutTime?: number // 자동 로그아웃 시간 (분)
  showWarning?: boolean // 경고 표시 여부
  onWarning?: () => void // 경고 콜백
  onLogout?: () => void // 로그아웃 콜백
}

export const useSessionExpiry = (options: SessionExpiryOptions = {}) => {
  const {
    warningTime = 5, // 기본 5분 전 경고
    logoutTime = 0, // 기본 즉시 로그아웃
    showWarning = true,
    onWarning,
    onLogout,
  } = options
  
  const { isAuthenticated, logout } = useAuthStore()
  const { addNotification } = useUIStore()
  
  const [isWarningShown, setIsWarningShown] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 세션 만료 처리
  const handleSessionExpiry = useCallback(() => {
    if (onLogout) {
      onLogout()
    }
    
    logout()
    
    if (showWarning) {
      addNotification({
        type: 'error',
        title: '세션 만료',
        message: '보안을 위해 자동으로 로그아웃되었습니다.',
        duration: 0, // 수동으로 닫을 때까지 표시
      })
    }
  }, [logout, onLogout, showWarning, addNotification])
  
  // 경고 표시
  const showExpiryWarning = useCallback((timeRemaining: number) => {
    if (isWarningShown) return
    
    setIsWarningShown(true)
    setTimeRemaining(timeRemaining)
    
    if (onWarning) {
      onWarning()
    }
    
    if (showWarning) {
      addNotification({
        type: 'warning',
        title: '세션 만료 경고',
        message: `${Math.ceil(timeRemaining / 60)}분 후 자동으로 로그아웃됩니다.`,
        duration: 0, // 수동으로 닫을 때까지 표시
      })
    }
  }, [isWarningShown, onWarning, showWarning, addNotification])
  
  // 카운트다운 시작
  const startCountdown = useCallback((timeRemaining: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    
    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null
        
        const newTime = prev - 1000
        if (newTime <= 0) {
          handleSessionExpiry()
          return 0
        }
        return newTime
      })
    }, 1000)
  }, [handleSessionExpiry])
  
  // 세션 만료 타이머 설정
  const setSessionTimer = useCallback((expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    const timeUntilExpiry = expiryTime - currentTime
    
    if (timeUntilExpiry <= 0) {
      // 이미 만료된 경우 즉시 로그아웃
      handleSessionExpiry()
      return
    }
    
    // 기존 타이머들 정리
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current)
    }
    
    // 경고 타이머 설정
    const warningTimeMs = warningTime * 60 * 1000
    if (timeUntilExpiry > warningTimeMs) {
      warningTimeoutRef.current = setTimeout(() => {
        const remainingTime = timeUntilExpiry - warningTimeMs
        showExpiryWarning(remainingTime)
        startCountdown(remainingTime)
      }, timeUntilExpiry - warningTimeMs)
    } else {
      // 경고 시간이 이미 지났으면 즉시 경고 표시
      showExpiryWarning(timeUntilExpiry)
      startCountdown(timeUntilExpiry)
    }
    
    // 로그아웃 타이머 설정
    const logoutTimeMs = logoutTime * 60 * 1000
    if (timeUntilExpiry > logoutTimeMs) {
      logoutTimeoutRef.current = setTimeout(() => {
        handleSessionExpiry()
      }, timeUntilExpiry - logoutTimeMs)
    } else {
      // 로그아웃 시간이 이미 지났으면 즉시 로그아웃
      handleSessionExpiry()
    }
  }, [warningTime, logoutTime, showExpiryWarning, startCountdown, handleSessionExpiry])
  
  // 세션 연장
  const extendSession = useCallback(() => {
    // 기존 타이머들 정리
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    
    // 상태 초기화
    setIsWarningShown(false)
    setTimeRemaining(null)
    
    // 새 세션 시간으로 타이머 재설정
    const newExpiryTime = new Date(Date.now() + 30 * 60 * 1000) // 30분 연장
    setSessionTimer(newExpiryTime.toISOString())
    
    if (showWarning) {
      addNotification({
        type: 'success',
        title: '세션 연장',
        message: '세션이 30분 연장되었습니다.',
      })
    }
  }, [setSessionTimer, showWarning, addNotification])
  
  // 인증 상태 변경 감지
  useEffect(() => {
    if (!isAuthenticated) {
      // 인증되지 않은 경우 모든 타이머 정리
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
      
      setIsWarningShown(false)
      setTimeRemaining(null)
    }
  }, [isAuthenticated])
  
  // 컴포넌트 언마운트시 정리
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])
  
  return {
    isWarningShown,
    timeRemaining,
    extendSession,
    setSessionTimer,
  }
}

// 페이지 가시성 기반 세션 관리
export const useVisibilitySession = () => {
  const { isAuthenticated } = useAuthStore()
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    if (!isAuthenticated) return
    
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible'
      setIsVisible(visible)
      
      if (visible) {
        // 페이지가 다시 보이면 세션 상태 확인
        // React Query가 자동으로 쿼리를 다시 실행함
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAuthenticated])
  
  return { isVisible }
}

// 사용자 활동 감지 기반 세션 관리
export const useActivitySession = () => {
  const { isAuthenticated } = useAuthStore()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  
  useEffect(() => {
    if (!isAuthenticated) return
    
    let activityTimer: NodeJS.Timeout
    
    const updateActivity = () => {
      setLastActivity(Date.now())
    }
    
    const resetActivityTimer = () => {
      clearTimeout(activityTimer)
      // 5분간 활동이 없으면 세션 검증
      activityTimer = setTimeout(() => {
        // React Query가 자동으로 쿼리를 다시 실행함
      }, 5 * 60 * 1000)
    }
    
    // 활동 이벤트 리스너
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })
    
    resetActivityTimer()
    
    return () => {
      clearTimeout(activityTimer)
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [isAuthenticated])
  
  return { lastActivity }
}
