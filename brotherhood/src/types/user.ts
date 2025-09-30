// 사용자 관리 관련 타입 정의

import { BaseFilter, PageRequest } from './common'

// UserCreateRequest.java와 매칭
export interface UserCreateRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  baptismalName: string
  password: string
  phone?: string
  branchId: string
  roleIds: string[]
}

// UserUpdateRequest.java와 매칭
export interface UserUpdateRequest {
  email?: string
  firstName?: string
  lastName?: string
  baptismalName?: string
  phone?: string
  branchId?: string
  roleIds?: string[]
  isActive?: boolean
}

// UserSearchRequest.java와 매칭
export interface UserSearchRequest extends BaseFilter, PageRequest {
  username?: string
  email?: string
  branchId?: string
  roleId?: string
  isActive?: boolean
}

// 역할 관련 타입
export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem: boolean
  createdAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

// 지사/분원 관리
export interface Branch {
  id: string
  name: string
  code: string
  address?: string
  phone?: string
  managerUserId?: string
  managerUserName?: string
  parentBranchId?: string
  parentBranchName?: string
  isActive: boolean
  createdAt: string
}

export interface BranchCreateRequest {
  name: string
  code: string
  address?: string
  phone?: string
  managerUserId?: string
  parentBranchId?: string
}

export interface BranchUpdateRequest {
  name?: string
  code?: string
  address?: string
  phone?: string
  managerUserId?: string
  parentBranchId?: string
  isActive?: boolean
}

// 사용자-역할 관계
export interface UserRole {
  id: string
  userId: string
  roleId: string
  roleName: string
  assignedBy: string
  assignedAt: string
  expiresAt?: string
}

// 권한 확인 요청
export interface PermissionCheckRequest {
  resource: string
  action: string
  entityId?: string
}

// 권한 확인 응답
export interface PermissionCheckResponse {
  hasPermission: boolean
  reason?: string
  requiredRoles?: string[]
}
