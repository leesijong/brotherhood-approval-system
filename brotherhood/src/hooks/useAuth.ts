// 인증 관련 React Query 훅

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services'
import { useAuthStore } from '@/stores'
import { QUERY_KEYS } from '@/providers'
import type {
  LoginRequest,
  PasswordChangeRequest,
  UserProfileUpdateRequest,
} from '@/types'

// 인증 상태 관리 훅
export const useAuth = () => {
  const { isAuthenticated, isLoading, user, login, logout, updateUser } = useAuthStore()
  
  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    updateUser,
  }
}

// 현재 사용자 정보 조회
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated, // 인증된 경우에만 실행
    select: (response) => response.data,
  })
}

// 로그인 뮤테이션
export const useLogin = () => {
  const { login: loginStore } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Zustand 스토어에 로그인 정보 저장
        loginStore(
          {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          },
          response.data.user
        )
        
        // 사용자 정보 캐시 설정
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, response.data.user)
      }
    },
  })
}

// 로그아웃 뮤테이션
export const useLogout = () => {
  const { logout: logoutStore } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // 즉시 로컬 상태에서 로그아웃 처리
      logoutStore()
      
      // 모든 쿼리 캐시 클리어
      queryClient.clear()
      
      // 인증 관련 스토리지만 정리 (다른 세션 데이터는 보존)
      localStorage.removeItem('brotherhood-auth')
    },
    onError: () => {
      // 에러가 발생해도 로컬에서는 로그아웃 처리
      logoutStore()
      queryClient.clear()
      localStorage.removeItem('brotherhood-auth')
    },
  })
}

// 프로필 업데이트 뮤테이션
export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updates: UserProfileUpdateRequest) => authApi.updateProfile(updates),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Zustand 스토어 업데이트
        updateUser(response.data)
        
        // 쿼리 캐시 업데이트
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, response.data)
      }
    },
  })
}

// 비밀번호 변경 뮤테이션
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (request: PasswordChangeRequest) => authApi.changePassword(request),
  })
}

// 세션 검증 쿼리
export const useSessionValidation = () => {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.SESSION,
    queryFn: () => authApi.validateSession(),
    enabled: isAuthenticated,
    select: (response) => response.data,
    refetchInterval: 5 * 60 * 1000, // 5분마다 검증
  })
}

// 세션 연장 뮤테이션
export const useExtendSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authApi.extendSession(),
    onSuccess: (response) => {
      if (response.success) {
        // 세션 정보 캐시 업데이트
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION })
      }
    },
  })
}

// 활성 세션 목록 조회
export const useActiveSessions = () => {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.SESSIONS,
    queryFn: () => authApi.getActiveSessions(),
    enabled: isAuthenticated,
    select: (response) => response.data,
  })
}

// 세션 종료 뮤테이션
export const useTerminateSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (sessionId: string) => authApi.terminateSession(sessionId),
    onSuccess: () => {
      // 세션 목록 다시 가져오기
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSIONS })
    },
  })
}

// 이메일 인증 요청 뮤테이션
export const useRequestEmailVerification = () => {
  return useMutation({
    mutationFn: () => authApi.requestEmailVerification(),
  })
}

// 이메일 인증 확인 뮤테이션
export const useVerifyEmail = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      // 사용자 정보 다시 가져오기 (인증 상태 업데이트)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME })
    },
  })
}

// 비밀번호 재설정 요청 뮤테이션
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  })
}

// 비밀번호 재설정 확인 뮤테이션
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => 
      authApi.resetPassword(token, newPassword),
  })
}
