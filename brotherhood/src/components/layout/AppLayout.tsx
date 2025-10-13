'use client';

import React, { useEffect } from 'react';
import { TopNavigation } from './TopNavigation';
import { DashboardSidebar } from '../dashboard-sidebar';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showTopNav?: boolean;
  className?: string;
  contentClassName?: string;
}

export function AppLayout({ 
  children, 
  showSidebar = true, 
  showTopNav = true,
  className,
  contentClassName
}: AppLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // 화면 크기 변화 감지하여 사이드바 상태 조정
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      
      if (isDesktop) {
        // 데스크톱에서는 사이드바를 항상 열어둠
        setSidebarOpen(true);
      } else {
        // 모바일에서는 사이드바를 닫음
        setSidebarOpen(false);
      }
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setSidebarOpen]);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Top Navigation */}
      {showTopNav && (
        <TopNavigation 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <DashboardSidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            // 모바일에서는 사이드바가 오버레이이므로 margin-left 없음
            "md:ml-64",
            showTopNav ? "pt-16" : "pt-0"
          )}
          role="main"
          aria-label="메인 콘텐츠"
        >
          <div className={cn(
            "p-4 md:p-6", // 모바일에서 패딩 줄임
            contentClassName
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
