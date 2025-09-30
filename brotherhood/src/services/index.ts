// Brotherhood 결재 시스템 API 서비스 통합 익스포트

// API 클라이언트 기본 설정
export { default as apiClient, apiRequest, createFormDataRequest, isApiError } from './api'

// 각 도메인별 API 서비스
import { authApi } from './authApi'
import { documentApi } from './documentApi'
import { approvalApi } from './approvalApi'
import { dashboardApi } from './dashboardApi'
import { userApi } from './userApi'

export { authApi, documentApi, approvalApi, dashboardApi, userApi }

// 통합 API 인터페이스 (모든 API를 하나의 객체로)
export const api = {
  auth: authApi,
  documents: documentApi,
  approvals: approvalApi,
  dashboard: dashboardApi,
  users: userApi,
} as const

// API 에러 핸들링 헬퍼
export const handleApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error.message) {
    return error.message
  }
  
  return '알 수 없는 오류가 발생했습니다.'
}

// API 성공 응답 확인 헬퍼
export const isSuccessResponse = <T>(response: any): response is { success: true; data: T } => {
  return response && response.success === true
}

// 기본 API 설정 상수
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    PASSWORD: '/auth/password',
  },
  
  // 문서
  DOCUMENTS: {
    BASE: '/documents',
    MY: '/documents/my',
    SEARCH: '/documents/search',
    RECENT: '/documents/recent',
    FAVORITES: '/documents/favorites',
    TEMPLATES: '/documents/templates',
    UPLOAD: '/documents/upload',
  },
  
  // 결재
  APPROVALS: {
    LINES: '/approvals/lines',
    STEPS: '/approvals/steps',
    MY_PENDING: '/approvals/my/pending',
    MY_PROCESSED: '/approvals/my/processed',
    STATS: '/approvals/stats',
    RECOMMENDATIONS: '/approvals/recommendations',
    DELEGATION: '/approvals/delegation',
  },
  
  // 대시보드
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITIES: '/dashboard/activities',
    NOTIFICATIONS: '/dashboard/notifications',
    WORKFLOW_STATUS: '/dashboard/workflow-status',
  },
  
  // 사용자
  USERS: {
    BASE: '/users',
    ROLES: '/users/roles',
    PERMISSIONS: '/users/permissions',
    SEARCH: '/users/search',
    IMPORT: '/users/import',
    EXPORT: '/users/export',
  },
  
  // 지사
  BRANCHES: {
    BASE: '/branches',
  },
} as const
