// 문서 관리 API 서비스

import { apiRequest, createFormDataRequest } from './api'
import type {
  Document,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentSearchRequest,
  Attachment,
  BaseResponse,
  PageResponse,
  FileUploadResponse
} from '@/types'

export const documentApi = {
  // 문서 목록 조회 (페이지네이션)
  getDocuments: async (params?: DocumentSearchRequest): Promise<BaseResponse<PageResponse<Document>>> => {
    return apiRequest<PageResponse<Document>>({
      method: 'GET',
      url: '/documents',
      params,
    })
  },

  // 문서 상세 조회
  getDocument: async (id: string): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'GET',
      url: `/documents/${id}`,
    })
  },

  // 문서 생성
  createDocument: async (document: DocumentCreateRequest): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'POST',
      url: '/documents',
      data: document,
    })
  },

  // 문서 수정
  updateDocument: async (id: string, updates: DocumentUpdateRequest): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'PUT',
      url: `/documents/${id}`,
      data: updates,
    })
  },

  // 문서 상신 (결재 요청)
  submitDocument: async (id: string): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'POST',
      url: `/documents/${id}/submit`,
    })
  },

  // 문서 승인
  approveDocument: async (id: string): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'POST',
      url: `/documents/${id}/approve`,
    })
  },

  // 문서 반려
  rejectDocument: async (id: string, rejectionReason: string): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'POST',
      url: `/documents/${id}/reject`,
      data: rejectionReason,
    })
  },

  // 문서 회수
  recallDocument: async (id: string): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'POST',
      url: `/documents/${id}/recall`,
    })
  },

  // 문서 복사
  copyDocument: async (id: string, title?: string): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'POST',
      url: `/documents/${id}/copy`,
      data: { title },
    })
  },

  // 내 문서 목록 조회
  getMyDocuments: async (params?: DocumentSearchRequest): Promise<BaseResponse<PageResponse<Document>>> => {
    return apiRequest<PageResponse<Document>>({
      method: 'GET',
      url: '/documents/my',
      params,
    })
  },

  // 문서 검색
  searchDocuments: async (params: DocumentSearchRequest): Promise<BaseResponse<PageResponse<Document>>> => {
    return apiRequest<PageResponse<Document>>({
      method: 'GET',
      url: '/documents/search',
      params,
    })
  },

  // 최근 문서 목록
  getRecentDocuments: async (limit: number = 10): Promise<BaseResponse<Document[]>> => {
    return apiRequest<Document[]>({
      method: 'GET',
      url: '/documents/recent',
      params: { limit },
    })
  },

  // 문서 즐겨찾기 추가/제거
  toggleFavorite: async (id: string): Promise<BaseResponse<{ isFavorite: boolean }>> => {
    return apiRequest<{ isFavorite: boolean }>({
      method: 'POST',
      url: `/documents/${id}/favorite`,
    })
  },

  // 즐겨찾기 문서 목록
  getFavoriteDocuments: async (params?: DocumentSearchRequest): Promise<BaseResponse<PageResponse<Document>>> => {
    return apiRequest<PageResponse<Document>>({
      method: 'GET',
      url: '/documents/favorites',
      params,
    })
  },

  // 파일 업로드
  uploadFile: async (
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<BaseResponse<FileUploadResponse>> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await createFormDataRequest('/documents/upload', formData, onUploadProgress)
    return response.data
  },

  // 다중 파일 업로드
  uploadFiles: async (
    files: File[],
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<BaseResponse<FileUploadResponse[]>> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })

    const response = await createFormDataRequest('/documents/upload/multiple', formData, onUploadProgress)
    return response.data
  },

  // 첨부파일 목록 조회
  getAttachments: async (documentId: string): Promise<BaseResponse<Attachment[]>> => {
    return apiRequest<Attachment[]>({
      method: 'GET',
      url: `/documents/${documentId}/attachments`,
    })
  },

  // 문서에 첨부파일 업로드
  uploadAttachment: async (
    documentId: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<BaseResponse<Attachment>> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await createFormDataRequest(`/documents/${documentId}/attachments/upload`, formData, onUploadProgress)
    return response.data
  },

  // 첨부파일 다운로드 URL 생성
  getDownloadUrl: async (attachmentId: string): Promise<BaseResponse<{ downloadUrl: string; expiresAt: string }>> => {
    return apiRequest<{ downloadUrl: string; expiresAt: string }>({
      method: 'GET',
      url: `/documents/attachments/${attachmentId}/download-url`,
    })
  },

  // 첨부파일 삭제
  deleteAttachment: async (attachmentId: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/documents/attachments/${attachmentId}`,
    })
  },

  // 문서 PDF 변환
  convertToPdf: async (id: string): Promise<BaseResponse<{ pdfUrl: string }>> => {
    return apiRequest<{ pdfUrl: string }>({
      method: 'POST',
      url: `/documents/${id}/convert-to-pdf`,
    })
  },

  // 문서 템플릿 목록
  getTemplates: async (): Promise<BaseResponse<Document[]>> => {
    return apiRequest<Document[]>({
      method: 'GET',
      url: '/documents/templates',
    })
  },

  // 템플릿으로 문서 생성
  createFromTemplate: async (templateId: string, title: string): Promise<BaseResponse<Document>> => {
    return apiRequest<Document>({
      method: 'POST',
      url: `/documents/templates/${templateId}/create`,
      data: { title },
    })
  },

  // 문서 삭제
  deleteDocument: async (id: string): Promise<BaseResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/documents/${id}`,
    })
  },
}
