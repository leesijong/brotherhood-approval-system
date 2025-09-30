// 사용자 관리 API 서비스

import { apiRequest } from './api'
import type {
  UserCreateRequest,
  UserUpdateRequest,
  UserSearchRequest,
  UserInfo,
  Role,
  Permission,
  Branch,
  BranchCreateRequest,
  BranchUpdateRequest,
  UserRole,
  PermissionCheckRequest,
  PermissionCheckResponse,
  BaseResponse,
  PageResponse
} from '@/types'

export const userApi = {
  // 사용자 목록 조회
  getUsers: async (params?: UserSearchRequest): Promise<BaseResponse<PageResponse<UserInfo>>> => {
    return apiRequest<PageResponse<UserInfo>>({
      method: 'GET',
      url: '/users',
      params,
    })
  },

  // 사용자 상세 조회
  getUser: async (id: string): Promise<BaseResponse<UserInfo>> => {
    return apiRequest<UserInfo>({
      method: 'GET',
      url: `/users/${id}`,
    })
  },

  // 사용자 생성
  createUser: async (user: UserCreateRequest): Promise<BaseResponse<UserInfo>> => {
    return apiRequest<UserInfo>({
      method: 'POST',
      url: '/users',
      data: user,
    })
  },

  // 사용자 수정
  updateUser: async (id: string, updates: UserUpdateRequest): Promise<BaseResponse<UserInfo>> => {
    return apiRequest<UserInfo>({
      method: 'PUT',
      url: `/users/${id}`,
      data: updates,
    })
  },

  // 사용자 삭제 (비활성화)
  deleteUser: async (id: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/users/${id}`,
    })
  },

  // 사용자 활성화/비활성화
  toggleUserStatus: async (id: string, isActive: boolean): Promise<BaseResponse<UserInfo>> => {
    return apiRequest<UserInfo>({
      method: 'PUT',
      url: `/users/${id}/status`,
      data: { isActive },
    })
  },

  // 사용자 비밀번호 재설정
  resetUserPassword: async (id: string, newPassword: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'PUT',
      url: `/users/${id}/password-reset`,
      data: { newPassword },
    })
  },

  // 역할 목록 조회
  getRoles: async (): Promise<BaseResponse<Role[]>> => {
    return apiRequest<Role[]>({
      method: 'GET',
      url: '/users/roles',
    })
  },

  // 사용자 역할 조회
  getUserRoles: async (userId: string): Promise<BaseResponse<UserRole[]>> => {
    return apiRequest<UserRole[]>({
      method: 'GET',
      url: `/users/${userId}/roles`,
    })
  },

  // 사용자 역할 할당
  assignUserRole: async (userId: string, roleId: string, expiresAt?: string): Promise<BaseResponse<UserRole>> => {
    return apiRequest<UserRole>({
      method: 'POST',
      url: `/users/${userId}/roles`,
      data: { roleId, expiresAt },
    })
  },

  // 사용자 역할 제거
  removeUserRole: async (userId: string, roleId: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/users/${userId}/roles/${roleId}`,
    })
  },

  // 권한 확인
  checkPermission: async (request: PermissionCheckRequest): Promise<BaseResponse<PermissionCheckResponse>> => {
    return apiRequest<PermissionCheckResponse>({
      method: 'POST',
      url: '/users/permissions/check',
      data: request,
    })
  },

  // 권한 목록 조회
  getPermissions: async (): Promise<BaseResponse<Permission[]>> => {
    return apiRequest<Permission[]>({
      method: 'GET',
      url: '/users/permissions',
    })
  },

  // 지사/분원 목록 조회
  getBranches: async (): Promise<BaseResponse<Branch[]>> => {
    return apiRequest<Branch[]>({
      method: 'GET',
      url: '/branches',
    })
  },

  // 지사/분원 상세 조회
  getBranch: async (id: string): Promise<BaseResponse<Branch>> => {
    return apiRequest<Branch>({
      method: 'GET',
      url: `/branches/${id}`,
    })
  },

  // 지사/분원 생성
  createBranch: async (branch: BranchCreateRequest): Promise<BaseResponse<Branch>> => {
    return apiRequest<Branch>({
      method: 'POST',
      url: '/branches',
      data: branch,
    })
  },

  // 지사/분원 수정
  updateBranch: async (id: string, updates: BranchUpdateRequest): Promise<BaseResponse<Branch>> => {
    return apiRequest<Branch>({
      method: 'PUT',
      url: `/branches/${id}`,
      data: updates,
    })
  },

  // 지사/분원 삭제
  deleteBranch: async (id: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/branches/${id}`,
    })
  },

  // 지사별 사용자 목록
  getBranchUsers: async (branchId: string, params?: UserSearchRequest): Promise<BaseResponse<PageResponse<UserInfo>>> => {
    return apiRequest<PageResponse<UserInfo>>({
      method: 'GET',
      url: `/branches/${branchId}/users`,
      params,
    })
  },

  // 사용자 검색 (자동완성용)
  searchUsers: async (query: string, limit: number = 10): Promise<BaseResponse<Array<{
    id: string
    username: string
    displayName: string
    email: string
    branchName: string
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: '/users/search',
      params: { query, limit },
    })
  },

  // 사용자 프로필 이미지 업로드
  uploadProfileImage: async (userId: string, file: File): Promise<BaseResponse<{ imageUrl: string }>> => {
    const formData = new FormData()
    formData.append('image', file)

    return apiRequest<{ imageUrl: string }>({
      method: 'POST',
      url: `/users/${userId}/profile-image`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 사용자 로그인 이력
  getUserLoginHistory: async (userId: string, params?: {
    page?: number
    size?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<BaseResponse<PageResponse<{
    id: string
    loginTime: string
    logoutTime?: string
    ipAddress: string
    userAgent: string
    success: boolean
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: `/users/${userId}/login-history`,
      params,
    })
  },

  // 일괄 사용자 가져오기 (Excel/CSV)
  importUsers: async (file: File): Promise<BaseResponse<{
    totalProcessed: number
    successCount: number
    failureCount: number
    errors: Array<{ row: number; error: string }>
  }>> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest({
      method: 'POST',
      url: '/users/import',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 사용자 데이터 내보내기
  exportUsers: async (params?: UserSearchRequest): Promise<BaseResponse<{ downloadUrl: string }>> => {
    return apiRequest<{ downloadUrl: string }>({
      method: 'POST',
      url: '/users/export',
      data: params,
    })
  },
}
