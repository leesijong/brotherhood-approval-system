// 대시보드 관련 API 서비스

import { apiRequest } from './api'
import type {
  DashboardStats,
  RecentActivity,
  Notification,
  Document,
  PendingApprovalItem,
  BaseResponse
} from '@/types'

export const dashboardApi = {
  // 대시보드 통계 데이터
  getDashboardStats: async (params?: {
    dateFrom?: string
    dateTo?: string
    branchId?: string
  }): Promise<BaseResponse<DashboardStats>> => {
    return apiRequest<DashboardStats>({
      method: 'GET',
      url: '/dashboard/stats',
      params,
    })
  },

  // 최근 활동 목록
  getRecentActivities: async (params?: {
    limit?: number
    type?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<BaseResponse<RecentActivity[]>> => {
    return apiRequest<RecentActivity[]>({
      method: 'GET',
      url: '/dashboard/activities',
      params,
    })
  },

  // 최근 문서 목록 (대시보드용)
  getRecentDocuments: async (limit: number = 5): Promise<BaseResponse<Document[]>> => {
    return apiRequest<Document[]>({
      method: 'GET',
      url: '/dashboard/recent-documents',
      params: { limit },
    })
  },

  // 사용자별 최근 문서 목록 (대시보드용)
  getRecentDocumentsByUser: async (userId: string, limit: number = 5): Promise<BaseResponse<Document[]>> => {
    return apiRequest<Document[]>({
      method: 'GET',
      url: `/dashboard/recent-documents/user/${userId}`,
      params: { limit },
    })
  },

  // 사용자별 대시보드 통계
  getDashboardStatsByUser: async (userId: string): Promise<BaseResponse<DashboardStats>> => {
    return apiRequest<DashboardStats>({
      method: 'GET',
      url: `/dashboard/stats/user/${userId}`,
    })
  },

  // 결재 대기 문서 목록 (대시보드용)
  getPendingApprovals: async (limit: number = 5): Promise<BaseResponse<PendingApprovalItem[]>> => {
    return apiRequest<PendingApprovalItem[]>({
      method: 'GET',
      url: '/dashboard/pending-approvals',
      params: { limit },
    })
  },

  // 알림 목록
  getNotifications: async (params?: {
    page?: number
    size?: number
    unreadOnly?: boolean
    type?: string
  }): Promise<BaseResponse<Notification[]>> => {
    return apiRequest<Notification[]>({
      method: 'GET',
      url: '/dashboard/notifications',
      params,
    })
  },

  // 읽지 않은 알림 개수
  getUnreadNotificationCount: async (): Promise<BaseResponse<{ count: number }>> => {
    return apiRequest<{ count: number }>({
      method: 'GET',
      url: '/dashboard/notifications/unread-count',
    })
  },

  // 알림 읽음 처리
  markNotificationAsRead: async (notificationId: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'PUT',
      url: `/dashboard/notifications/${notificationId}/read`,
    })
  },

  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: async (): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'PUT',
      url: '/dashboard/notifications/read-all',
    })
  },

  // 알림 삭제
  deleteNotification: async (notificationId: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/dashboard/notifications/${notificationId}`,
    })
  },

  // 워크플로우 현황 (진행 중인 결재 프로세스)
  getWorkflowStatus: async (): Promise<BaseResponse<Array<{
    documentId: string
    documentTitle: string
    currentStep: string
    currentApprover: string
    startedAt: string
    estimatedCompletion?: string
    isOverdue: boolean
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: '/dashboard/workflow-status',
    })
  },

  // 내 작업 요약
  getMyWorkSummary: async (): Promise<BaseResponse<{
    drafts: number
    submitted: number
    pendingMyApproval: number
    approvedToday: number
    rejectedToday: number
    delegatedToMe: number
  }>> => {
    return apiRequest({
      method: 'GET',
      url: '/dashboard/my-work-summary',
    })
  },

  // 부서/지사별 통계 (관리자용)
  getBranchStats: async (branchId?: string): Promise<BaseResponse<Array<{
    branchId: string
    branchName: string
    totalDocuments: number
    pendingApprovals: number
    averageProcessingTime: number
    efficiency: number
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: '/dashboard/branch-stats',
      params: branchId ? { branchId } : undefined,
    })
  },

  // 결재 처리 시간 통계
  getProcessingTimeStats: async (params?: {
    dateFrom?: string
    dateTo?: string
    documentType?: string
    branchId?: string
  }): Promise<BaseResponse<{
    averageTime: number
    medianTime: number
    fastest: number
    slowest: number
    timeDistribution: Array<{
      range: string
      count: number
    }>
  }>> => {
    return apiRequest({
      method: 'GET',
      url: '/dashboard/processing-time-stats',
      params,
    })
  },

  // 인기 문서 유형 통계
  getPopularDocumentTypes: async (params?: {
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<BaseResponse<Array<{
    documentType: string
    count: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>>> => {
    return apiRequest({
      method: 'GET',
      url: '/dashboard/popular-document-types',
      params,
    })
  },

  // 시스템 상태 정보 (관리자용)
  getSystemHealth: async (): Promise<BaseResponse<{
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    activeUsers: number
    systemLoad: number
    databaseStatus: 'connected' | 'disconnected'
    lastBackup?: string
    warnings: string[]
  }>> => {
    return apiRequest({
      method: 'GET',
      url: '/dashboard/system-health',
    })
  },
}
