import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserInfo {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  baptismalName?: string
  displayName: string
  branchId: string
  branchName: string
  branch?: {
    id: string
    name: string
  }
  roles: string[]
  isActive: boolean
  phone?: string
  address?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isLoggingOut: boolean
  enableTestUser: boolean
  
  login: (tokens: { accessToken: string; refreshToken: string }, user: UserInfo) => void
  logout: () => void
  updateUser: (user: UserInfo) => void
  setLoading: (loading: boolean) => void
  setLoggingOut: (loggingOut: boolean) => void
  setEnableTestUser: (enable: boolean) => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isLoggingOut: false,
      enableTestUser: true,
      
      login: (tokens, user) => {
        set({
          isAuthenticated: true,
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isLoading: false,
        })
      },
      
      logout: () => {
        console.log('authStore logout 호출됨');
        
        // localStorage와 sessionStorage 완전 정리
        try {
          localStorage.removeItem('brotherhood-auth');
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          console.warn('스토리지 정리 중 오류:', error);
        }
        
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          isLoggingOut: true, // 로그아웃 상태로 설정하여 자동 로그인 방지
          enableTestUser: false, // 테스트 사용자 비활성화
        })
        console.log('authStore 상태 초기화 완료');
      },
      
      updateUser: (user) => {
        set({ user })
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading })
      },
      
      setLoggingOut: (loggingOut) => {
        set({ isLoggingOut: loggingOut })
      },
      
      setEnableTestUser: (enable) => {
        set({ enableTestUser: enable })
      },
      
      hasRole: (role) => {
        const { user } = get()
        return user?.roles?.includes(role) ?? false
      },
      
      hasAnyRole: (roles) => {
        const { user } = get()
        return roles.some(role => user?.roles?.includes(role)) ?? false
      },
      
    }),
    {
      name: 'brotherhood-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggingOut: state.isLoggingOut,
        enableTestUser: false, // 항상 false로 설정
      }),
    }
  )
)
