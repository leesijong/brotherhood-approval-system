// Brotherhood 결재 시스템 타입 통합 익스포트

// 인증 관련
export type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  TokenRefreshRequest,
  PasswordChangeRequest,
  UserProfileUpdateRequest
} from './auth'

// 문서 관련
export type {
  Document,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentSearchRequest,
  Attachment,
  ApprovalLine,
  ApprovalStep
} from './document'

export {
  DocumentType,
  DocumentStatus,
  SecurityLevel,
  Priority,
  ApprovalStatus
} from './document'

// 결재 관련
export type {
  ApprovalActionRequest,
  ApprovalLineCreateRequest,
  ApprovalStepCreateRequest,
  ApprovalStats,
  PendingApprovalItem,
  ApprovalHistoryItem,
  ApprovalLineRecommendationRequest,
  ApprovalLineRecommendation
} from './approval'

export {
  ApprovalAction,
  ApprovalStepType
} from './approval'

// 사용자 관리
export type {
  UserCreateRequest,
  UserUpdateRequest,
  UserSearchRequest,
  Role,
  Permission,
  Branch,
  BranchCreateRequest,
  BranchUpdateRequest,
  UserRole,
  PermissionCheckRequest,
  PermissionCheckResponse
} from './user'

// 공통 타입
export type {
  BaseResponse,
  PageResponse,
  ErrorResponse,
  ValidationError,
  SortOption,
  PageRequest,
  BaseFilter,
  FileUploadResponse,
  DashboardStats,
  RecentActivity,
  Notification
} from './common'

export {
  ActivityType,
  NotificationType
} from './common'
import type { BaseResponse, PageResponse } from './common'

// 타입 가드 함수들
export const isErrorResponse = (response: any): response is { success: false; error: string } => {
  return response && response.success === false && typeof response.error === 'string'
}

export const isBaseResponse = <T>(response: any): response is BaseResponse<T> => {
  return response && typeof response.success === 'boolean' && typeof response.message === 'string'
}

export const isPageResponse = <T>(response: any): response is PageResponse<T> => {
  return response && 
         Array.isArray(response.content) &&
         typeof response.page === 'number' &&
         typeof response.size === 'number' &&
         typeof response.totalElements === 'number'
}
