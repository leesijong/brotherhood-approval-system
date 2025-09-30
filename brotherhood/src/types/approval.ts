// 결재 관련 타입 정의 (백엔드 DTO와 매칭)

import { ApprovalStatus } from './document'

// ApprovalActionRequest.java와 매칭
export interface ApprovalActionRequest {
  action: ApprovalAction
  comments?: string
  delegateToUserId?: string
}

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  DELEGATE = 'DELEGATE',
  RETURN = 'RETURN'
}

// ApprovalLineCreateRequest.java와 매칭
export interface ApprovalLineCreateRequest {
  documentId: string
  name: string
  description?: string
  steps: ApprovalStepCreateRequest[]
}

// ApprovalStepCreateRequest.java와 매칭
export interface ApprovalStepCreateRequest {
  approverId: string
  stepOrder: number
  stepType: ApprovalStepType
  isRequired: boolean
}

export enum ApprovalStepType {
  SEQUENTIAL = 'SEQUENTIAL',
  PARALLEL = 'PARALLEL',
  CONDITIONAL = 'CONDITIONAL',
  NOTIFICATION = 'NOTIFICATION'
}

// 결재 통계 정보
export interface ApprovalStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  overdueCount: number
}

// 결재 대기 목록 항목
export interface PendingApprovalItem {
  id: string
  documentId: string
  documentTitle: string
  documentType: string
  authorName: string
  priority: string
  submittedAt: string
  dueDate?: string
  isOverdue: boolean
}

// 결재 이력 항목
export interface ApprovalHistoryItem {
  id: string
  stepId: string
  approverId: string
  approverName: string
  action: ApprovalAction
  comments?: string
  completedAt: string
  delegatedFromId?: string
  delegatedFromName?: string
}

// 결재선 추천 요청
export interface ApprovalLineRecommendationRequest {
  documentType: string
  securityLevel: string
  branchId: string
  amount?: number
}

// 결재선 추천 응답
export interface ApprovalLineRecommendation {
  id: string
  name: string
  description: string
  steps: {
    approverId: string
    approverName: string
    approverRole: string
    stepOrder: number
    stepType: ApprovalStepType
    isRequired: boolean
  }[]
  isDefault: boolean
}
