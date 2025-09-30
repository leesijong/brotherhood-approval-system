// 권한 관리 React Query 훅 (RBAC + ABAC)

import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import type {
  PermissionCheckRequest,
  PermissionCheckResponse,
  Role,
  Permission,
} from '@/types'

// 권한 확인 훅 (테스트용 - 실제 API 호출 대신 mock 데이터 반환)
export const useCheckPermission = (request: PermissionCheckRequest) => {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['permissions', 'check', request],
    queryFn: async () => {
      // 테스트용 mock 응답
      return {
        success: true,
        data: {
          hasPermission: true,
          reason: '테스트용 권한 허용'
        }
      }
    },
    select: (response) => response.data,
    enabled: isAuthenticated && !!request.resource && !!request.action,
    staleTime: 2 * 60 * 1000, // 2분간 캐시
  })
}

// 모든 권한 목록 조회 (테스트용)
export const usePermissionsList = () => {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['permissions', 'list'],
    queryFn: async () => {
      // 테스트용 mock 응답
      return {
        success: true,
        data: [
          { id: '1', name: 'document:read', description: '문서 읽기' },
          { id: '2', name: 'document:create', description: '문서 생성' },
          { id: '3', name: 'approval:read', description: '결재 읽기' },
        ]
      }
    },
    select: (response) => response.data,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10분간 캐시
  })
}

// 사용자 역할 목록 조회 (테스트용)
export const useUserRoles = (userId?: string) => {
  const { isAuthenticated, user } = useAuthStore()
  const targetUserId = userId || user?.id
  
  return useQuery({
    queryKey: ['users', 'roles', targetUserId],
    queryFn: async () => {
      // 테스트용 mock 응답
      return {
        success: true,
        data: [
          { id: '1', roleId: '1', roleName: 'USER', expiresAt: null },
          { id: '2', roleId: '2', roleName: 'SUPERVISOR', expiresAt: null },
        ]
      }
    },
    select: (response) => response.data,
    enabled: isAuthenticated && !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  })
}

// 역할 목록 조회 (테스트용)
export const useRoles = () => {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['roles', 'list'],
    queryFn: async () => {
      // 테스트용 mock 응답
      return {
        success: true,
        data: [
          { id: '1', name: 'USER', description: '일반 사용자' },
          { id: '2', name: 'SUPERVISOR', description: '중간관리자' },
          { id: '3', name: 'MANAGER', description: '관리자' },
          { id: '4', name: 'ADMIN', description: '시스템 관리자' },
        ]
      }
    },
    select: (response) => response.data,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10분간 캐시
  })
}

// 권한 기반 접근 제어 훅
export const usePermissionChecks = () => {
  const { user, hasRole, hasAnyRole } = useAuthStore()
  
  // 특정 권한 확인
  const hasPermission = async (resource: string, action: string, entityId?: string) => {
    if (!user) return false
    
    // 기본 역할 기반 권한 확인
    const roleBasedAccess = checkRoleBasedPermission(user.roles, resource, action)
    if (roleBasedAccess) return true
    
    // 필요시 서버에서 추가 권한 확인
    // const serverCheck = await userApi.checkPermission({ resource, action, entityId })
    // return serverCheck.data.hasPermission
    
    return false
  }
  
  // 여러 권한 중 하나라도 있는지 확인
  const hasAnyPermission = (permissions: Array<{ resource: string; action: string }>) => {
    if (!user) return false
    
    return permissions.some(({ resource, action }) => 
      checkRoleBasedPermission(user.roles, resource, action)
    )
  }
  
  // 모든 권한이 있는지 확인
  const hasAllPermissions = (permissions: Array<{ resource: string; action: string }>) => {
    if (!user) return false
    
    return permissions.every(({ resource, action }) => 
      checkRoleBasedPermission(user.roles, resource, action)
    )
  }
  
  // 문서 관련 권한 확인
  const canViewDocument = (document: any) => {
    if (!user) return false
    
    // 자신이 작성한 문서는 항상 볼 수 있음
    if (document.authorId === user.id) return true
    
    // 보안 등급에 따른 접근 제어
    if (document.securityLevel === 'SECRET') {
      return hasRole('ADMIN') || hasRole('MANAGER')
    }
    
    if (document.securityLevel === 'CONFIDENTIAL') {
      return hasAnyRole(['ADMIN', 'MANAGER', 'SUPERVISOR'])
    }
    
    // 일반 문서는 모든 인증된 사용자가 볼 수 있음
    return true
  }
  
  const canEditDocument = (document: any) => {
    if (!user) return false
    
    // 자신이 작성한 문서이고 아직 제출되지 않은 경우
    if (document.authorId === user.id && document.status === 'DRAFT') {
      return true
    }
    
    // 관리자는 모든 문서를 편집할 수 있음
    if (hasRole('ADMIN')) return true
    
    return false
  }
  
  const canDeleteDocument = (document: any) => {
    if (!user) return false
    
    // 자신이 작성한 문서이고 아직 제출되지 않은 경우
    if (document.authorId === user.id && document.status === 'DRAFT') {
      return true
    }
    
    // 관리자만 삭제 가능
    return hasRole('ADMIN')
  }
  
  // 결재 관련 권한 확인
  const canApprove = (approvalStep: any) => {
    if (!user) return false
    
    // 결재자 본인인지 확인
    if (approvalStep.approverId === user.id) return true
    
    // 위임된 결재인지 확인
    // TODO: 위임 로직 구현
    
    return false
  }
  
  const canDelegate = () => {
    if (!user) return false
    
    // 중간관리자 이상만 위임 가능
    return hasAnyRole(['ADMIN', 'MANAGER', 'SUPERVISOR'])
  }
  
  // 사용자 관리 권한 확인
  const canManageUsers = () => {
    if (!user) return false
    
    return hasAnyRole(['ADMIN', 'MANAGER'])
  }
  
  const canViewUserDetails = (targetUserId: string) => {
    if (!user) return false
    
    // 자신의 정보는 항상 볼 수 있음
    if (targetUserId === user.id) return true
    
    // 관리자는 모든 사용자 정보를 볼 수 있음
    return canManageUsers()
  }
  
  // 시스템 설정 권한 확인
  const canManageSystem = () => {
    if (!user) return false
    
    return hasRole('ADMIN')
  }
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canViewDocument,
    canEditDocument,
    canDeleteDocument,
    canApprove,
    canDelegate,
    canManageUsers,
    canViewUserDetails,
    canManageSystem,
  }
}

// 역할 기반 권한 확인 헬퍼 함수
const checkRoleBasedPermission = (userRoles: string[], resource: string, action: string): boolean => {
  // 권한 매트릭스 정의
  const permissionMatrix: Record<string, Record<string, string[]>> = {
    'documents': {
      'view': ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'],
      'create': ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'],
      'edit': ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'],
      'delete': ['ADMIN'],
      'approve': ['SUPERVISOR', 'MANAGER', 'ADMIN'],
    },
    'approvals': {
      'view': ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'],
      'process': ['SUPERVISOR', 'MANAGER', 'ADMIN'],
      'delegate': ['SUPERVISOR', 'MANAGER', 'ADMIN'],
      'manage': ['MANAGER', 'ADMIN'],
    },
    'users': {
      'view': ['MANAGER', 'ADMIN'],
      'create': ['MANAGER', 'ADMIN'],
      'edit': ['MANAGER', 'ADMIN'],
      'delete': ['ADMIN'],
      'manage_roles': ['ADMIN'],
    },
    'system': {
      'view': ['ADMIN'],
      'configure': ['ADMIN'],
      'manage': ['ADMIN'],
    },
    'reports': {
      'view': ['SUPERVISOR', 'MANAGER', 'ADMIN'],
      'export': ['MANAGER', 'ADMIN'],
    },
  }
  
  const allowedRoles = permissionMatrix[resource]?.[action]
  if (!allowedRoles) return false
  
  return userRoles.some(role => allowedRoles.includes(role))
}
