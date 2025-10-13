import { create } from 'zustand'

// 화면 크기 감지를 위한 유틸리티
const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768; // md breakpoint
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  globalLoading: boolean
  notifications: Notification[]
  
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: UIState['theme']) => void
  setGlobalLoading: (loading: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false, // 초기값: 닫힌 상태 (모바일 우선)
  theme: 'system',
  globalLoading: false,
  notifications: [],
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    set((state) => ({ notifications: [...state.notifications, newNotification] }))
    
    // 자동 제거
    const duration = notification.duration || 5000
    setTimeout(() => {
      set((state) => ({ 
        notifications: state.notifications.filter(n => n.id !== id) 
      }))
    }, duration)
  },
  
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter(n => n.id !== id) 
  })),
  
  clearNotifications: () => set({ notifications: [] }),
}))
