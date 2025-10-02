'use client';

import React, { useState } from 'react';
import { Menu, Bell, User, Settings, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authApi } from '@/services/authApi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogoutConfirmDialog } from '@/components/ConfirmDialog';

interface TopNavigationProps {
  onMenuClick: () => void;
}

export function TopNavigation({ onMenuClick }: TopNavigationProps) {
  const { user, logout, isLoggingOut, setLoggingOut } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOutLocal, setIsLoggingOutLocal] = useState(false);
  const router = useRouter();

  // 테스트용 알림 개수 (실제로는 API에서 가져올 예정)
  const unreadNotifications = 3;

  const handleLogout = async () => {
    console.log('로그아웃 시작');
    setIsLoggingOutLocal(true);
    
    try {
      // 1. 먼저 로그아웃 상태로 설정
      console.log('로그아웃 상태로 설정');
      setLoggingOut(true);
      
      // 2. localStorage 완전히 정리
      console.log('localStorage 정리');
      localStorage.removeItem('brotherhood-auth');
      localStorage.clear(); // 모든 localStorage 정리
      
      // 3. sessionStorage도 정리
      console.log('sessionStorage 정리');
      sessionStorage.clear();
      
      // 4. 로컬 상태에서 로그아웃 처리
      console.log('로컬 상태에서 로그아웃 처리');
      logout();
      
      // 5. 백엔드 로그아웃 API 호출 (선택적)
      try {
        await authApi.logout();
        console.log('백엔드 로그아웃 성공');
      } catch (apiError) {
        console.warn('백엔드 로그아웃 실패 (무시됨):', apiError);
      }
      
      // 6. 페이지 새로고침으로 완전한 상태 초기화
      console.log('페이지 새로고침으로 상태 초기화');
      window.location.href = '/login';
      
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 에러가 발생해도 페이지 새로고침으로 로그인 페이지로 이동
      window.location.href = '/login';
    } finally {
      setShowLogoutDialog(false);
      setIsLoggingOutLocal(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image 
                src="/images/brotherhood-logo.png" 
                alt="한국순교복자성직수도회" 
                width={32}
                height={32}
                className="w-8 h-8"
                priority
                onError={(e) => {
                  // 이미지 로드 실패 시 Shield 아이콘으로 대체
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>';
                  }
                }}
              />
            </div>
            <span className="font-semibold text-lg text-foreground">
              Brotherhood
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="문서, 사용자, 결재선 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.displayName} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || '사용자'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || '이메일 없음'}
                  </p>
                  {user?.baptismalName && (
                    <p className="text-xs leading-none text-primary">
                      세례명: {user.baptismalName}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={(open) => {
          setShowLogoutDialog(open);
          if (!open) {
            setIsLoggingOutLocal(false);
          }
        }}
        onConfirm={handleLogout}
        loading={isLoggingOutLocal}
      />
    </header>
  );
}
