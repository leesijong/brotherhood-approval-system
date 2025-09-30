export { useAuthStore } from './authStore'
export { useUIStore } from './uiStore'
import { useAuthStore } from './authStore'

// 헬퍼 훅
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore()
  return isAuthenticated ? user : null
}
