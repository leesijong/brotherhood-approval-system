// 인증 관련 API 서비스

import { apiRequest, apiClient } from './api'
import type {
  LoginRequest,
  LoginResponse,
  TokenRefreshRequest,
  PasswordChangeRequest,
  UserProfileUpdateRequest,
  UserInfo,
  BaseResponse
} from '@/types'

export const authApi = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<BaseResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    })
  },

  // 로그아웃
  logout: async (): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/logout',
    })
  },

  // 토큰 갱신
  refreshToken: async (request: TokenRefreshRequest): Promise<BaseResponse<{ accessToken: string; refreshToken: string }>> => {
    return apiRequest<{ accessToken: string; refreshToken: string }>({
      method: 'POST',
      url: '/auth/refresh',
      data: request,
    })
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<BaseResponse<UserInfo>> => {
    return apiRequest<UserInfo>({
      method: 'GET',
      url: '/auth/me',
    })
  },

  // 사용자 프로필 업데이트
  updateProfile: async (updates: UserProfileUpdateRequest): Promise<BaseResponse<UserInfo>> => {
    return apiRequest<UserInfo>({
      method: 'PUT',
      url: '/auth/profile',
      data: updates,
    })
  },

  // 비밀번호 변경
  changePassword: async (request: PasswordChangeRequest): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'PUT',
      url: '/auth/password',
      data: request,
    })
  },

  // 이메일 인증 요청
  requestEmailVerification: async (): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/verify-email/request',
    })
  },

  // 이메일 인증 확인
  verifyEmail: async (token: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/verify-email/confirm',
      data: { token },
    })
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/password/reset-request',
      data: { email },
    })
  },

  // 비밀번호 재설정 확인
  resetPassword: async (token: string, newPassword: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/password/reset-confirm',
      data: { token, newPassword },
    })
  },

  // 세션 검증
  validateSession: async (): Promise<BaseResponse<{ valid: boolean; expiresAt: string }>> => {
    return apiRequest<{ valid: boolean; expiresAt: string }>({
      method: 'GET',
      url: '/auth/session/validate',
    })
  },

  // 세션 연장
  extendSession: async (): Promise<BaseResponse<{ expiresAt: string }>> => {
    return apiRequest<{ expiresAt: string }>({
      method: 'POST',
      url: '/auth/session/extend',
    })
  },

  // 활성 세션 목록 조회
  getActiveSessions: async (): Promise<BaseResponse<Array<{
    id: string
    deviceInfo: string
    ipAddress: string
    lastActivity: string
    current: boolean
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: '/auth/sessions',
    })
  },

  // 특정 세션 종료
  terminateSession: async (sessionId: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/auth/sessions/${sessionId}`,
    })
  },

  // 모든 다른 세션 종료
  terminateOtherSessions: async (): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: '/auth/sessions/others',
    })
  },
}
