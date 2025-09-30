// Brotherhood 테마 관리 훅

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  // 컴포넌트가 마운트된 후에만 테마 정보 반환
  useEffect(() => {
    setMounted(true)
  }, [])

  // 테마 토글
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // 다크 모드 여부
  const isDark = resolvedTheme === 'dark'
  
  // 라이트 모드 여부
  const isLight = resolvedTheme === 'light'
  
  // 시스템 테마 사용 여부
  const isSystem = theme === 'system'

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    mounted,
    toggleTheme,
    isDark,
    isLight,
    isSystem,
  }
}

// 테마 아이콘 컴포넌트용 훅
export function useThemeIcon() {
  const { theme, resolvedTheme, mounted } = useTheme()

  if (!mounted) {
    return 'system' // 로딩 중에는 시스템 아이콘 표시
  }

  if (theme === 'system') {
    return 'system'
  }

  return resolvedTheme === 'dark' ? 'dark' : 'light'
}
