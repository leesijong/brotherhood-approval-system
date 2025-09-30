// 문서 관련 타입 정의 (백엔드 DTO와 매칭)

// DocumentDto.java와 매칭
export interface Document {
  id: string
  title: string
  content: string
  documentType: DocumentType
  status: DocumentStatus
  securityLevel: SecurityLevel
  priority: Priority
  documentNumber?: string  // 백엔드에 있음
  version?: number  // 백엔드에 있음
  isFinal?: boolean  // 백엔드에 있음
  parentDocumentId?: string  // 백엔드에 있음
  submittedAt?: string  // 백엔드에 있음
  approvedAt?: string  // 백엔드에 있음
  rejectedAt?: string  // 백엔드에 있음
  rejectionReason?: string  // 백엔드에 있음
  authorId: string
  authorName: string
  authorDisplayName?: string  // 백엔드에 있음
  branchId: string
  branchName: string
  branchCode?: string  // 백엔드에 있음
  attachments: Attachment[]
  approvalLines: ApprovalLine[]
  comments?: Comment[]  // 백엔드에 있음
  createdAt: string
  updatedAt: string
}

// DocumentCreateRequest.java와 매칭
export interface DocumentCreateRequest {
  title: string
  content: string
  documentType: DocumentType
  securityLevel: SecurityLevel
  priority: Priority
  tags?: string[]
  attachmentIds?: string[]
}

// DocumentUpdateRequest.java와 매칭
export interface DocumentUpdateRequest {
  title?: string
  content?: string
  documentType?: DocumentType
  securityLevel?: SecurityLevel
  priority?: Priority
  tags?: string[]
}

// DocumentSearchRequest.java와 매칭
export interface DocumentSearchRequest {
  query?: string
  documentType?: DocumentType
  status?: DocumentStatus
  securityLevel?: SecurityLevel
  priority?: Priority
  authorId?: string
  branchId?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  page?: number
  size?: number
  sort?: string
  direction?: 'ASC' | 'DESC'
}

// AttachmentDto.java와 매칭
export interface Attachment {
  id: string
  fileName: string
  originalFileName: string
  fileSize: number
  contentType: string
  filePath: string
  documentId: string
  uploadedBy: string
  uploadedAt: string
}

// CommentDto.java와 매칭
export interface Comment {
  id: string
  documentId: string
  content: string
  authorId: string
  authorName: string
  authorDisplayName?: string
  parentCommentId?: string
  isInternal: boolean
  createdAt: string
  updatedAt?: string
}

// Enums (백엔드와 매칭)
export enum DocumentType {
  GENERAL = 'GENERAL',
  PURCHASE = 'PURCHASE',
  HR = 'HR',
  FINANCE = 'FINANCE',
  PROJECT = 'PROJECT',
  POLICY = 'POLICY'
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum SecurityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET'
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// ApprovalLineDto.java와 매칭
export interface ApprovalLine {
  id: string
  documentId: string
  name: string
  description?: string
  isParallel?: boolean  // 백엔드에 있음
  isConditional?: boolean  // 백엔드에 있음
  conditionExpression?: string  // 백엔드에 있음
  createdById?: string  // 백엔드에 있음
  createdByName?: string  // 백엔드에 있음
  approvalSteps: ApprovalStep[]
  createdAt: string
  updatedAt?: string  // 백엔드에 있음
}

// ApprovalStepDto.java와 매칭
export interface ApprovalStep {
  id: string
  approvalLineId: string
  approverId: string
  approverName: string
  approverDisplayName?: string  // 백엔드에 있음
  stepOrder: number
  approverType?: string  // 백엔드에 있음 (stepType -> approverType)
  isRequired: boolean
  isDelegatable?: boolean  // 백엔드에 있음
  maxDelegationLevel?: number  // 백엔드에 있음
  delegatedToId?: string  // 백엔드에 있음
  delegatedToName?: string  // 백엔드에 있음
  delegatedToDisplayName?: string  // 백엔드에 있음
  createdAt?: string  // 백엔드에 있음
  updatedAt?: string  // 백엔드에 있음
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELEGATED = 'DELEGATED',
  SKIPPED = 'SKIPPED'
}
