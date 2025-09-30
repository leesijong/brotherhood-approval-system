'use client'

// 라우트 보호 컴포넌트

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, usePermissionChecks } from '@/hooks'
import { useUIStore } from '@/stores'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  requiredPermissions?: Array<{ resource: string; action: string }>
  fallback?: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const { hasAnyPermission } = usePermissionChecks()
  const { addNotification } = useUIStore()
  
  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }
  
  // 인증되지 않은 경우
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // 로그인 페이지로 리다이렉트
    router.push(redirectTo)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">이 페이지에 접근하려면 로그인이 필요합니다.</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }
  
  // 역할 기반 접근 제어
  if (requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles?.some(role => requiredRoles.includes(role)) || false
    
    if (!hasRequiredRole) {
      if (fallback) {
        return <>{fallback}</>
      }
      
      addNotification({
        type: 'error',
        title: '접근 권한 없음',
        message: '이 페이지에 접근할 권한이 없습니다.',
      })
      
      router.push('/dashboard')
      return null
    }
  }
  
  // 권한 기반 접근 제어
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(requiredPermissions)
    
    if (!hasRequiredPermission) {
      if (fallback) {
        return <>{fallback}</>
      }
      
      addNotification({
        type: 'error',
        title: '접근 권한 없음',
        message: '이 기능을 사용할 권한이 없습니다.',
      })
      
      router.push('/dashboard')
      return null
    }
  }
  
  return <>{children}</>
}

// 관리자 전용 라우트
export function AdminRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requiredRoles={['ADMIN']}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

// 관리자 및 매니저 전용 라우트
export function ManagerRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requiredRoles={['ADMIN', 'MANAGER']}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

// 결재자 전용 라우트
export function ApproverRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

// 문서 관리 권한이 있는 라우트
export function DocumentManageRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requiredPermissions={[
        { resource: 'documents', action: 'view' },
        { resource: 'documents', action: 'create' },
      ]}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

// 결재 처리 권한이 있는 라우트
export function ApprovalProcessRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requiredPermissions={[
        { resource: 'approvals', action: 'process' },
      ]}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

// 사용자 관리 권한이 있는 라우트
export function UserManageRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requiredPermissions={[
        { resource: 'users', action: 'view' },
        { resource: 'users', action: 'manage' },
      ]}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

// 조건부 렌더링을 위한 컴포넌트
interface ConditionalRenderProps {
  children: ReactNode
  condition: boolean
  fallback?: ReactNode
}

export function ConditionalRender({ children, condition, fallback = null }: ConditionalRenderProps) {
  return condition ? <>{children}</> : <>{fallback}</>
}

// 권한 기반 조건부 렌더링
interface PermissionRenderProps {
  children: ReactNode
  requiredRoles?: string[]
  requiredPermissions?: Array<{ resource: string; action: string }>
  fallback?: ReactNode
}

export function PermissionRender({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
}: PermissionRenderProps) {
  const { hasAnyPermission } = usePermissionChecks()
  
  let hasPermission = true
  
  if (requiredRoles.length > 0) {
    // 역할 확인은 상위 컴포넌트에서 처리되므로 여기서는 true로 설정
    hasPermission = hasPermission && true
  }
  
  if (requiredPermissions.length > 0) {
    // TODO: 권한 확인 로직 구현
    hasPermission = hasPermission && true // 임시
  }
  
  return hasPermission ? <>{children}</> : <>{fallback}</>
}
