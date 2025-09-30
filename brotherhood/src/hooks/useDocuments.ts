// 문서 관리 관련 React Query 훅

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '@/services'
import { QUERY_KEYS } from '@/providers'
import type {
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentSearchRequest,
} from '@/types'

// 문서 목록 조회 (페이지네이션)
export const useDocuments = (params?: DocumentSearchRequest) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.LIST(params),
    queryFn: () => documentApi.getDocuments(params),
    select: (response) => response.data,
  })
}

// 문서 상세 조회
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.DETAIL(id),
    queryFn: () => documentApi.getDocument(id),
    select: (response) => response.data,
    enabled: !!id,
  })
}

// 내 문서 목록 조회
export const useMyDocuments = (params?: DocumentSearchRequest) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.MY(params),
    queryFn: () => documentApi.getMyDocuments(params),
    select: (response) => response.data,
  })
}

// 최근 문서 목록
export const useRecentDocuments = (limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.RECENT(limit),
    queryFn: () => documentApi.getRecentDocuments(limit),
    select: (response) => response.data,
  })
}

// 즐겨찾기 문서 목록
export const useFavoriteDocuments = (params?: DocumentSearchRequest) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.FAVORITES(params),
    queryFn: () => documentApi.getFavoriteDocuments(params),
    select: (response) => response.data,
  })
}

// 문서 검색
export const useSearchDocuments = (params: DocumentSearchRequest) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.SEARCH(params),
    queryFn: () => documentApi.searchDocuments(params),
    select: (response) => response.data,
    enabled: !!params.query || Object.keys(params).length > 1, // 검색어가 있거나 다른 필터가 있을 때만 실행
  })
}

// 문서 템플릿 목록
export const useDocumentTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.TEMPLATES,
    queryFn: () => documentApi.getTemplates(),
    select: (response) => response.data,
  })
}

// 첨부파일 목록 조회
export const useAttachments = (documentId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.ATTACHMENTS(documentId),
    queryFn: () => documentApi.getAttachments(documentId),
    select: (response) => response.data,
    enabled: !!documentId,
  })
}

// 문서 생성 뮤테이션
export const useCreateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (document: DocumentCreateRequest) => documentApi.createDocument(document),
    onSuccess: () => {
      // 문서 목록 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL })
    },
  })
}

// 문서 수정 뮤테이션
export const useUpdateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DocumentUpdateRequest }) =>
      documentApi.updateDocument(id, updates),
    onSuccess: (response, { id }) => {
      if (response.success && response.data) {
        // 특정 문서 캐시 업데이트
        queryClient.setQueryData(QUERY_KEYS.DOCUMENTS.DETAIL(id), response.data)
        
        // 문서 목록들 무효화
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL })
      }
    },
  })
}

// 문서 삭제 뮤테이션
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: (_, id) => {
      // 특정 문서 캐시 제거
      queryClient.removeQueries({ queryKey: QUERY_KEYS.DOCUMENTS.DETAIL(id) })
      
      // 문서 목록들 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL })
    },
  })
}

// 문서 상신 뮤테이션
export const useSubmitDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, approvalLineId }: { id: string; approvalLineId: string }) =>
      documentApi.submitDocument(id),
    onSuccess: (response, { id }) => {
      if (response.success && response.data) {
        // 문서 상태 업데이트
        queryClient.setQueryData(QUERY_KEYS.DOCUMENTS.DETAIL(id), response.data)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL })
        
        // 결재 관련 쿼리들도 무효화
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS.ALL })
      }
    },
  })
}

// 문서 회수 뮤테이션
export const useWithdrawDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      documentApi.recallDocument(id),
    onSuccess: (response, { id }) => {
      if (response.success && response.data) {
        queryClient.setQueryData(QUERY_KEYS.DOCUMENTS.DETAIL(id), response.data)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS.ALL })
      }
    },
  })
}

// 문서 복사 뮤테이션
export const useCopyDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title?: string }) =>
      documentApi.copyDocument(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL })
    },
  })
}

// 즐겨찾기 토글 뮤테이션
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => documentApi.toggleFavorite(id),
    onSuccess: (_, id) => {
      // 문서 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.DETAIL(id) })
      // 즐겨찾기 목록 갱신
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.FAVORITES() })
    },
  })
}

// 파일 업로드 뮤테이션
export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: any) => void }) =>
      documentApi.uploadFile(file, onProgress),
  })
}

// 다중 파일 업로드 뮤테이션
export const useUploadFiles = () => {
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress?: (progress: any) => void }) =>
      documentApi.uploadFiles(files, onProgress),
  })
}

// 첨부파일 삭제 뮤테이션
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (attachmentId: string) => documentApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      // 첨부파일 목록들 무효화
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'documents' && 
          query.queryKey[2] === 'attachments'
      })
    },
  })
}

// 다운로드 URL 생성 뮤테이션
export const useGetDownloadUrl = () => {
  return useMutation({
    mutationFn: (attachmentId: string) => documentApi.getDownloadUrl(attachmentId),
  })
}

// PDF 변환 뮤테이션
export const useConvertToPdf = () => {
  return useMutation({
    mutationFn: (id: string) => documentApi.convertToPdf(id),
  })
}

// 템플릿으로 문서 생성 뮤테이션
export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ templateId, title }: { templateId: string; title: string }) =>
      documentApi.createFromTemplate(templateId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.ALL })
    },
  })
}
