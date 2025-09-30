// 결재 관련 API 서비스

import { apiRequest } from './api'
import type {
  ApprovalActionRequest,
  ApprovalLineCreateRequest,
  ApprovalStats,
  PendingApprovalItem,
  ApprovalHistoryItem,
  ApprovalLineRecommendationRequest,
  ApprovalLineRecommendation,
  ApprovalLine,
  BaseResponse,
  PageResponse
} from '@/types'

export const approvalApi = {
  // 결재 처리 (승인/반려/위임)
  processApproval: async (stepId: string, action: ApprovalActionRequest): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: `/approvals/steps/${stepId}/process`,
      data: action,
    })
  },

  // 결재선 생성
  createApprovalLine: async (request: ApprovalLineCreateRequest): Promise<BaseResponse<ApprovalLine>> => {
    return apiRequest<ApprovalLine>({
      method: 'POST',
      url: '/approvals/lines',
      data: request,
    })
  },

  // 결재선 조회
  getApprovalLine: async (id: string): Promise<BaseResponse<ApprovalLine>> => {
    return apiRequest<ApprovalLine>({
      method: 'GET',
      url: `/approvals/lines/${id}`,
    })
  },

  // 문서의 결재선 목록 조회
  getDocumentApprovalLines: async (documentId: string): Promise<BaseResponse<ApprovalLine[]>> => {
    return apiRequest<ApprovalLine[]>({
      method: 'GET',
      url: `/approvals/lines/document/${documentId}`,
    })
  },

  // 결재선 수정
  updateApprovalLine: async (id: string, updates: Partial<ApprovalLineCreateRequest>): Promise<BaseResponse<ApprovalLine>> => {
    return apiRequest<ApprovalLine>({
      method: 'PUT',
      url: `/approvals/lines/${id}`,
      data: updates,
    })
  },

  // 결재선 삭제
  deleteApprovalLine: async (id: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/approvals/lines/${id}`,
    })
  },

  // 내 결재 대기 목록
  getMyPendingApprovals: async (params?: {
    page?: number
    size?: number
    sort?: string
    direction?: 'ASC' | 'DESC'
  }): Promise<BaseResponse<PageResponse<PendingApprovalItem>>> => {
    return apiRequest<PageResponse<PendingApprovalItem>>({
      method: 'GET',
      url: '/approvals/my/pending',
      params,
    })
  },

  // 내가 처리한 결재 목록
  getMyProcessedApprovals: async (params?: {
    page?: number
    size?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<BaseResponse<PageResponse<ApprovalHistoryItem>>> => {
    return apiRequest<PageResponse<ApprovalHistoryItem>>({
      method: 'GET',
      url: '/approvals/my-processed',
      params,
    })
  },

  // 결재 통계
  getApprovalStats: async (params?: {
    dateFrom?: string
    dateTo?: string
    branchId?: string
  }): Promise<BaseResponse<ApprovalStats>> => {
    return apiRequest<ApprovalStats>({
      method: 'GET',
      url: '/approvals/stats',
      params,
    })
  },

  // 결재 이력 조회
  getApprovalHistory: async (documentId: string): Promise<BaseResponse<ApprovalHistoryItem[]>> => {
    return apiRequest<ApprovalHistoryItem[]>({
      method: 'GET',
      url: `/approvals/history/document/${documentId}`,
    })
  },

  // 결재선 추천
  getApprovalLineRecommendations: async (
    request: ApprovalLineRecommendationRequest
  ): Promise<BaseResponse<ApprovalLineRecommendation[]>> => {
    return apiRequest<ApprovalLineRecommendation[]>({
      method: 'POST',
      url: '/approvals/recommendations',
      data: request,
    })
  },

  // 기본 결재선 목록
  getDefaultApprovalLines: async (params?: {
    documentType?: string
    branchId?: string
  }): Promise<BaseResponse<ApprovalLineRecommendation[]>> => {
    return apiRequest<ApprovalLineRecommendation[]>({
      method: 'GET',
      url: '/approvals/defaults',
      params,
    })
  },

  // 결재 위임 설정
  setDelegation: async (params: {
    delegateToUserId: string
    startDate: string
    endDate: string
    reason?: string
  }): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: '/approvals/delegation',
      data: params,
    })
  },

  // 결재 위임 해제
  removeDelegation: async (delegationId: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/approvals/delegation/${delegationId}`,
    })
  },

  // 내 위임 설정 목록
  getMyDelegations: async (): Promise<BaseResponse<Array<{
    id: string
    delegateToUserId: string
    delegateToUserName: string
    startDate: string
    endDate: string
    reason?: string
    isActive: boolean
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: '/approvals/my/delegations',
    })
  },

  // 긴급 승인 요청
  requestUrgentApproval: async (stepId: string, reason: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: `/approvals/steps/${stepId}/urgent`,
      data: { reason },
    })
  },

  // 결재 재요청 (반려 후)
  resubmitForApproval: async (documentId: string, reason?: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: `/approvals/documents/${documentId}/resubmit`,
      data: { reason },
    })
  },

  // 결재 단계 건너뛰기 (권한 필요)
  skipApprovalStep: async (stepId: string, reason: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: `/approvals/steps/${stepId}/skip`,
      data: { reason },
    })
  },

  // 병렬 결재에서 다른 결재자 의견 조회
  getParallelApprovalComments: async (stepId: string): Promise<BaseResponse<Array<{
    approverId: string
    approverName: string
    comments?: string
    status: string
    completedAt?: string
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: `/approvals/steps/${stepId}/parallel-comments`,
    })
  },

  // 결재 마감일 설정
  setApprovalDeadline: async (stepId: string, deadline: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'PUT',
      url: `/approvals/steps/${stepId}/deadline`,
      data: { deadline },
    })
  },

  // 결재 알림 재전송
  resendApprovalNotification: async (stepId: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'POST',
      url: `/approvals/steps/${stepId}/notify`,
    })
  },
}
