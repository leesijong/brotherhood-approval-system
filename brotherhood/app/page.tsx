'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      // 로그인된 경우 대시보드로 리다이렉트
      router.push('/dashboard')
    } else {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // 리다이렉트 중 로딩 화면
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">페이지를 불러오는 중...</p>
      </div>
    </div>
  )
}
