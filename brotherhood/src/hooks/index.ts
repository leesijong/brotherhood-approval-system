// Brotherhood 시스템 React Query 훅 통합 익스포트

// 인증 관련 훅
export {
  useCurrentUser,
  useLogin,
  useLogout,
  useUpdateProfile,
  useChangePassword,
  useSessionValidation,
  useExtendSession,
  useActiveSessions,
  useTerminateSession,
  useRequestEmailVerification,
  useVerifyEmail,
  useRequestPasswordReset,
  useResetPassword,
} from './useAuth'

// useAuth 훅 (인증 상태 관리)
export { useAuth } from './useAuth'

// 권한 관리 관련 훅
export {
  useCheckPermission,
  usePermissionsList,
  usePermissionChecks,
  useUserRoles,
  useRoles,
} from './usePermissions'

// 토큰 갱신 관련 훅
export {
  useTokenRefresh,
  useAutoTokenRefresh,
  useTokenExpiryRefresh,
  useManualTokenRefresh,
} from './useTokenRefresh'

// 세션 만료 관련 훅
export {
  useSessionExpiry,
  useVisibilitySession,
  useActivitySession,
} from './useSessionExpiry'

// 문서 관리 관련 훅
export {
  useDocuments,
  useDocument,
  useMyDocuments,
  useRecentDocuments,
  useFavoriteDocuments,
  useSearchDocuments,
  useDocumentTemplates,
  useAttachments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useSubmitDocument,
  useWithdrawDocument,
  useCopyDocument,
  useToggleFavorite,
  useUploadFile,
  useUploadFiles,
  useDeleteAttachment,
  useGetDownloadUrl,
  useConvertToPdf,
  useCreateFromTemplate,
} from './useDocuments'

// 커스텀 훅 타입 정의
export type {
  // 추후 필요시 타입 추가
} from './useAuth'
