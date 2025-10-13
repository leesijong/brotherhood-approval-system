'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  FilePlus,
  ClipboardList,
  UserCheck,
  Shield,
  Bell,
  ChevronDown,
  ChevronRight,
  Database,
  History,
  Activity,
  Calendar,
  MessageSquare,
  HelpCircle,
  LogOut,
  UserCog,
  Building,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { usePermissionChecks } from '@/hooks/usePermissions';
import { dashboardApi } from '@/services/dashboardApi';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  permission?: string;
  badge?: number;
  children?: MenuItem[];
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { hasPermission } = usePermissionChecks();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  // 임시 해결책: admin 사용자에게 ADMIN 역할 강제 추가
  const userRoles = user?.roles || [];
  const isAdminUser = user?.username === 'admin';
  const effectiveRoles = isAdminUser && !userRoles.includes('ADMIN')
    ? [...userRoles, 'ADMIN']
    : userRoles;

  // 디버깅을 위한 사용자 정보 로그
  console.log('사이드바 사용자 정보:', {
    user,
    roles: user?.roles,
    hasAdmin: user?.roles?.includes('ADMIN'),
    hasSuperAdmin: user?.roles?.includes('SUPER_ADMIN'),
    effectiveRoles,
    isAdminUser
  });

  // 결재 대기 수 조회
  useEffect(() => {
    const loadPendingApprovalsCount = async () => {
      if (!user?.id) {
        setPendingApprovalsCount(0);
        return;
      }

      try {
        const response = await dashboardApi.getPendingApprovals();
        if (response.success && response.data) {
          setPendingApprovalsCount(response.data.length);
        } else {
          setPendingApprovalsCount(0);
        }
      } catch (error) {
        console.error('결재 대기 수 조회 실패:', error);
        setPendingApprovalsCount(0);
      }
    };

    loadPendingApprovalsCount();
  }, [user]);

  const getMenuItems = (): MenuItem[] => [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: Home,
      href: '/dashboard',
    },
    {
      id: 'documents',
      label: '문서 관리',
      icon: FileText,
      href: '/documents',
      permission: 'document:read',
      children: [
        {
          id: 'documents-list',
          label: '문서 목록',
          icon: ClipboardList,
          href: '/documents',
          permission: 'document:read',
        },
        {
          id: 'documents-create',
          label: '문서 작성',
          icon: FilePlus,
          href: '/documents/create',
          permission: 'document:create',
        },
        {
          id: 'documents-templates',
          label: '문서 템플릿',
          icon: FileText,
          href: '/documents/templates',
          permission: 'document:admin',
        },
        {
          id: 'documents-categories',
          label: '문서 분류',
          icon: ClipboardList,
          href: '/documents/categories',
          permission: 'document:admin',
        },
      ],
    },
    {
      id: 'approvals',
      label: '결재 관리',
      icon: CheckCircle,
      href: '/approvals',
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      children: [
        {
          id: 'approvals-pending',
          label: '결재 대기',
          icon: UserCheck,
          href: '/approvals/pending',
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        },
        {
          id: 'approvals-history',
          label: '결재 이력',
          icon: History,
          href: '/approvals/history',
        },
        {
          id: 'approvals-workflow',
          label: '결재 워크플로우',
          icon: Activity,
          href: '/approvals/workflow',
        },
        {
          id: 'approvals-delegation',
          label: '결재 위임',
          icon: UserCheck,
          href: '/approvals/delegation',
        },
      ],
    },
    {
      id: 'users',
      label: '사용자 관리',
      icon: Users,
      href: '/users',
      permission: 'user:read',
      children: [
        {
          id: 'users-list',
          label: '사용자 목록',
          icon: Users,
          href: '/users',
          permission: 'user:read',
        },
        {
          id: 'users-roles',
          label: '역할 관리',
          icon: Shield,
          href: '/users/roles',
          permission: 'user:admin',
        },
        {
          id: 'users-permissions',
          label: '권한 관리',
          icon: UserCog,
          href: '/users/permissions',
          permission: 'user:admin',
        },
        {
          id: 'users-departments',
          label: '부서 관리',
          icon: Building,
          href: '/users/departments',
          permission: 'user:admin',
        },
      ],
    },
    {
      id: 'reports',
      label: '통계/리포트',
      icon: BarChart3,
      href: '/reports',
      permission: 'report:read',
      children: [
        {
          id: 'reports-dashboard',
          label: '대시보드',
          icon: BarChart3,
          href: '/reports/dashboard',
          permission: 'report:read',
        },
        {
          id: 'reports-documents',
          label: '문서 통계',
          icon: FileText,
          href: '/reports/documents',
          permission: 'report:read',
        },
        {
          id: 'reports-approvals',
          label: '결재 통계',
          icon: CheckCircle,
          href: '/reports/approvals',
          permission: 'report:read',
        },
        {
          id: 'reports-users',
          label: '사용자 통계',
          icon: Users,
          href: '/reports/users',
          permission: 'report:admin',
        },
        {
          id: 'reports-system',
          label: '시스템 통계',
          icon: Activity,
          href: '/reports/system',
          permission: 'report:admin',
        },
      ],
    },
    {
      id: 'system',
      label: '시스템 관리',
      icon: Database,
      href: '/system',
      permission: 'system:admin',
      children: [
        {
          id: 'system-logs',
          label: '시스템 로그',
          icon: Activity,
          href: '/system/logs',
          permission: 'system:admin',
        },
        {
          id: 'system-backup',
          label: '백업 관리',
          icon: Database,
          href: '/system/backup',
          permission: 'system:admin',
        },
        {
          id: 'system-config',
          label: '시스템 설정',
          icon: Settings,
          href: '/system/config',
          permission: 'system:admin',
        },
        {
          id: 'system-monitoring',
          label: '시스템 모니터링',
          icon: Activity,
          href: '/system/monitoring',
          permission: 'system:admin',
        },
      ],
    },
    {
      id: 'communication',
      label: '소통/알림',
      icon: MessageSquare,
      href: '/communication',
      permission: 'communication:read',
      children: [
        {
          id: 'communication-notifications',
          label: '알림 관리',
          icon: Bell,
          href: '/communication/notifications',
          permission: 'communication:read',
        },
        {
          id: 'communication-announcements',
          label: '공지사항',
          icon: MessageSquare,
          href: '/communication/announcements',
          permission: 'communication:read',
        },
        {
          id: 'communication-calendar',
          label: '일정 관리',
          icon: Calendar,
          href: '/communication/calendar',
          permission: 'communication:read',
        },
      ],
    },
    {
      id: 'settings',
      label: '설정',
      icon: Settings,
      href: '/settings',
      permission: 'settings:read',
      children: [
        {
          id: 'settings-profile',
          label: '프로필',
          icon: UserCheck,
          href: '/profile',
        },
        {
          id: 'settings-notifications',
          label: '알림 설정',
          icon: Bell,
          href: '/settings/notifications',
        },
        {
          id: 'settings-security',
          label: '보안 설정',
          icon: Shield,
          href: '/settings/security',
          permission: 'settings:security',
        },
        {
          id: 'settings-preferences',
          label: '환경 설정',
          icon: Settings,
          href: '/settings/preferences',
        },
        {
          id: 'settings-integration',
          label: '연동 설정',
          icon: Database,
          href: '/settings/integration',
          permission: 'settings:admin',
        },
      ],
    },
    {
      id: 'help',
      label: '도움말',
      icon: HelpCircle,
      href: '/help',
      children: [
        {
          id: 'help-guide',
          label: '사용 가이드',
          icon: HelpCircle,
          href: '/help/guide',
        },
        {
          id: 'help-faq',
          label: '자주 묻는 질문',
          icon: MessageSquare,
          href: '/help/faq',
        },
        {
          id: 'help-support',
          label: '고객 지원',
          icon: Phone,
          href: '/help/support',
        },
        {
          id: 'help-contact',
          label: '문의하기',
          icon: Mail,
          href: '/help/contact',
        },
      ],
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      // 하위 메뉴가 있는 경우: 토글만 하고 사이드바는 유지
      toggleExpanded(item.id);
    } else if (item.href) {
      // 하위 메뉴가 없는 경우: 페이지 이동 후 모바일에서 사이드바 닫기
      router.push(item.href);
      if (window.innerWidth < 768) {
        onClose();
      }
    }
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => child.href && pathname === child.href);
    }
    return false;
  };

  const hasAccess = (item: MenuItem): boolean => {
    // 사용자 정보가 없으면 기본 메뉴만 표시
    if (!user) {
      return item.id === 'dashboard' || item.id === 'help';
    }
    
    // 사용자 역할이 없으면 기본 메뉴만 표시
    if (!user.roles || user.roles.length === 0) {
      return item.id === 'dashboard' || item.id === 'help';
    }
    
    const userRoles = user.roles || [];
    const isAdminUser = user.username === 'admin';
    const effectiveRoles = isAdminUser && !userRoles.includes('ADMIN') 
      ? [...userRoles, 'ADMIN'] 
      : userRoles;
    
    // 관리자 이상의 권한을 가진 사용자는 모든 메뉴에 접근 가능
    if (effectiveRoles.includes('ADMIN') || effectiveRoles.includes('SUPER_ADMIN')) {
      return true;
    }
    
    // 권한이 없는 메뉴는 모든 사용자에게 표시
    if (!item.permission) return true;
    
    // 권한 문자열을 파싱 (예: "document:read" -> resource: "document", action: "read")
    const [resource, action] = item.permission.split(':');
    
    // 리소스별 권한 확인
    if (resource === 'document') {
      if (action === 'read' || action === 'create') {
        return effectiveRoles.some(role => ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'].includes(role));
      }
      if (action === 'edit' || action === 'delete') {
        return effectiveRoles.some(role => ['MANAGER', 'ADMIN'].includes(role));
      }
      if (action === 'admin') {
        return effectiveRoles.some(role => ['ADMIN'].includes(role));
      }
    }
    
    if (resource === 'approval') {
      if (action === 'read') {
        return effectiveRoles.some(role => ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'].includes(role));
      }
      if (action === 'admin') {
        return effectiveRoles.some(role => ['ADMIN'].includes(role));
      }
    }
    
    if (resource === 'user') {
      if (action === 'read') {
        return effectiveRoles.some(role => ['MANAGER', 'ADMIN'].includes(role));
      }
      if (action === 'admin') {
        return effectiveRoles.some(role => ['ADMIN'].includes(role));
      }
    }
    
    if (resource === 'report') {
      if (action === 'read') {
        return effectiveRoles.some(role => ['SUPERVISOR', 'MANAGER', 'ADMIN'].includes(role));
      }
      if (action === 'admin') {
        return effectiveRoles.some(role => ['ADMIN'].includes(role));
      }
    }
    
    if (resource === 'system') {
      if (action === 'admin') {
        return effectiveRoles.some(role => ['ADMIN'].includes(role));
      }
    }
    
    if (resource === 'communication') {
      if (action === 'read') {
        return effectiveRoles.some(role => ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'].includes(role));
      }
    }
    
    if (resource === 'settings') {
      if (action === 'read') {
        return effectiveRoles.some(role => ['USER', 'SUPERVISOR', 'MANAGER', 'ADMIN'].includes(role));
      }
      if (action === 'security' || action === 'admin') {
        return effectiveRoles.some(role => ['ADMIN'].includes(role));
      }
    }
    
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    if (!hasAccess(item)) return null;

    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="space-y-1">
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 transition-colors min-h-[44px]",
            // 모바일에서 더 명확한 색상 대비
            "text-gray-100 md:text-sidebar-foreground",
            "hover:bg-gray-800 hover:text-white md:hover:bg-sidebar-accent md:hover:text-sidebar-accent-foreground",
            isActive && "bg-gray-800 text-white md:bg-sidebar-primary md:text-sidebar-primary-foreground",
            level > 0 && "ml-4 text-sm"
          )}
          size="sm"
          onClick={() => handleItemClick(item)}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-current={isActive ? "page" : undefined}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left truncate">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredMenuItems = getMenuItems().filter(hasAccess);

  return (
    <>
      {/* Mobile Overlay - 모바일에서 사이드바가 열릴 때만 표시 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-sidebar-border z-50 transition-transform duration-300 ease-in-out",
          // 모바일에서 더 진한 배경색과 그림자 효과
          "bg-gray-900 md:bg-sidebar",
          "shadow-2xl md:shadow-none",
          // 데스크톱에서는 항상 표시, 모바일에서는 상태에 따라 표시/숨김
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="메인 네비게이션"
      >
        <div className="flex flex-col h-full">
          {/* Quick Actions */}
          <div className="p-3 md:p-4 border-b border-sidebar-border">
            <Button 
              className="w-full justify-start gap-2 min-h-[44px] bg-red-600 hover:bg-red-700 text-white border-0" 
              size="sm"
              onClick={() => {
                router.push('/documents/create');
                onClose(); // 모바일에서 메뉴 클릭 후 사이드바 닫기
              }}
              aria-label="새 문서 작성하기"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm md:text-base">새 문서 작성</span>
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 md:space-y-2" role="menubar">
            {filteredMenuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* User Info */}
          <div className="p-3 md:p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-sm font-medium">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 md:text-sidebar-foreground truncate">
                  {user?.displayName || '사용자'}
                </p>
                <p className="text-xs text-gray-300 md:text-sidebar-foreground/70 truncate">
                  {user?.branch?.name || '지사'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
