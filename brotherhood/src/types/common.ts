// 공통 타입 정의 (백엔드 BaseResponse.java와 매칭)

// 기본 API 응답 구조
export interface BaseResponse<T = any> {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

// 페이지네이션 응답 (PageResponse.java와 매칭)
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

// API 에러 응답
export interface ErrorResponse {
  success: false
  message: string
  error: string
  status: number
  path: string
  timestamp: string
  validationErrors?: ValidationError[]
}

// 유효성 검사 에러
export interface ValidationError {
  field: string
  message: string
  rejectedValue?: any
}

// 정렬 옵션
export interface SortOption {
  field: string
  direction: 'ASC' | 'DESC'
}

// 페이지네이션 요청 파라미터
export interface PageRequest {
  page?: number
  size?: number
  sort?: string
  direction?: 'ASC' | 'DESC'
}

// 검색 필터 기본 인터페이스
export interface BaseFilter {
  query?: string
  dateFrom?: string
  dateTo?: string
}

// 파일 업로드 응답
export interface FileUploadResponse {
  id: string
  fileName: string
  originalFileName: string
  fileSize: number
  contentType: string
  uploadedAt: string
}

// 대시보드 통계 (DashboardStatsDto.java와 매칭)
export interface DashboardStats {
  totalDocuments: number
  pendingApprovals: number
  approvedDocuments: number  // 백엔드와 일치
  rejectedDocuments: number  // 백엔드와 일치
  draftDocuments: number  // 백엔드에 있음
  urgentDocuments: number  // 백엔드에 있음
  totalUsers: number  // 백엔드에 있음
  activeUsers: number  // 백엔드에 있음
  totalBranches: number  // 백엔드에 있음
  totalAttachments: number  // 백엔드에 있음
  totalComments: number  // 백엔드에 있음
}

// 최근 활동 항목
export interface RecentActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  userId: string
  userName: string
  createdAt: string
  relatedEntityId?: string
  relatedEntityType?: string
}

export enum ActivityType {
  DOCUMENT_CREATED = 'DOCUMENT_CREATED',
  DOCUMENT_SUBMITTED = 'DOCUMENT_SUBMITTED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  APPROVAL_DELEGATED = 'APPROVAL_DELEGATED',
  USER_LOGIN = 'USER_LOGIN'
}

// 알림 타입
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  userId: string
  relatedEntityId?: string
  relatedEntityType?: string
  createdAt: string
}

export enum NotificationType {
  APPROVAL_REQUEST = 'APPROVAL_REQUEST',
  APPROVAL_COMPLETED = 'APPROVAL_COMPLETED',
  DOCUMENT_SUBMITTED = 'DOCUMENT_SUBMITTED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}
