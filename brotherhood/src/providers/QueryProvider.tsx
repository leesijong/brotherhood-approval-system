'use client'

// React Query Provider 설정

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// React Query 클라이언트 설정
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 기본 옵션
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
        retry: (failureCount, error: any) => {
          // 인증 에러나 403/404는 재시도하지 않음
          if (error?.response?.status === 401 || 
              error?.response?.status === 403 || 
              error?.response?.status === 404) {
            return false
          }
          // 최대 3번 재시도
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false, // 창 포커스시 자동 리페치 비활성화
        refetchOnMount: 'always', // 마운트시 항상 리페치
      },
      mutations: {
        // 뮤테이션 기본 옵션
        retry: false,
        onError: (error: any) => {
          // 전역 에러 처리 (필요시)
          console.error('Mutation error:', error)
        },
      },
    },
  })
}

// QueryClient 인스턴스 (SSR 지원)
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버 사이드: 항상 새 클라이언트 생성
    return createQueryClient()
  } else {
    // 클라이언트 사이드: 싱글톤 패턴
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient()
    }
    return browserQueryClient
  }
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom"
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  )
}

// Query Keys 상수 정의 (일관성과 타입 안전성을 위해)
export const QUERY_KEYS = {
  // 인증
  AUTH: {
    ME: ['auth', 'me'] as const,
    SESSION: ['auth', 'session'] as const,
    SESSIONS: ['auth', 'sessions'] as const,
  },
  
  // 문서
  DOCUMENTS: {
    ALL: ['documents'] as const,
    LIST: (params?: any) => ['documents', 'list', params] as const,
    DETAIL: (id: string) => ['documents', 'detail', id] as const,
    MY: (params?: any) => ['documents', 'my', params] as const,
    RECENT: (limit?: number) => ['documents', 'recent', limit] as const,
    FAVORITES: (params?: any) => ['documents', 'favorites', params] as const,
    SEARCH: (params: any) => ['documents', 'search', params] as const,
    TEMPLATES: ['documents', 'templates'] as const,
    ATTACHMENTS: (documentId: string) => ['documents', documentId, 'attachments'] as const,
  },
  
  // 결재
  APPROVALS: {
    ALL: ['approvals'] as const,
    LINES: (documentId?: string) => documentId 
      ? ['approvals', 'lines', documentId] as const 
      : ['approvals', 'lines'] as const,
    LINE_DETAIL: (id: string) => ['approvals', 'lines', 'detail', id] as const,
    PENDING: (params?: any) => ['approvals', 'pending', params] as const,
    PROCESSED: (params?: any) => ['approvals', 'processed', params] as const,
    STATS: (params?: any) => ['approvals', 'stats', params] as const,
    HISTORY: (documentId: string) => ['approvals', 'history', documentId] as const,
    RECOMMENDATIONS: (params: any) => ['approvals', 'recommendations', params] as const,
    DEFAULTS: (params?: any) => ['approvals', 'defaults', params] as const,
    DELEGATIONS: ['approvals', 'delegations'] as const,
  },
  
  // 대시보드
  DASHBOARD: {
    STATS: (params?: any) => ['dashboard', 'stats', params] as const,
    ACTIVITIES: (params?: any) => ['dashboard', 'activities', params] as const,
    NOTIFICATIONS: (params?: any) => ['dashboard', 'notifications', params] as const,
    UNREAD_COUNT: ['dashboard', 'notifications', 'unread-count'] as const,
    WORKFLOW_STATUS: ['dashboard', 'workflow-status'] as const,
    WORK_SUMMARY: ['dashboard', 'work-summary'] as const,
    BRANCH_STATS: (branchId?: string) => ['dashboard', 'branch-stats', branchId] as const,
    SYSTEM_HEALTH: ['dashboard', 'system-health'] as const,
  },
  
  // 사용자
  USERS: {
    ALL: ['users'] as const,
    LIST: (params?: any) => ['users', 'list', params] as const,
    DETAIL: (id: string) => ['users', 'detail', id] as const,
    ROLES: (userId?: string) => userId 
      ? ['users', userId, 'roles'] as const 
      : ['users', 'roles'] as const,
    PERMISSIONS: ['users', 'permissions'] as const,
    SEARCH: (query: string, limit?: number) => ['users', 'search', query, limit] as const,
    LOGIN_HISTORY: (userId: string, params?: any) => ['users', userId, 'login-history', params] as const,
  },
  
  // 지사
  BRANCHES: {
    ALL: ['branches'] as const,
    DETAIL: (id: string) => ['branches', 'detail', id] as const,
    USERS: (branchId: string, params?: any) => ['branches', branchId, 'users', params] as const,
  },
} as const

// 타입 헬퍼
export type QueryKey = typeof QUERY_KEYS[keyof typeof QUERY_KEYS]
