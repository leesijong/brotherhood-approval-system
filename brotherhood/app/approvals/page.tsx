'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/DataTable';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi } from '@/services/dashboardApi';
import { documentApi } from '@/services/documentApi';
import Link from 'next/link';

// 결재 항목 타입
interface ApprovalItem {
  id: string;
  title: string;
  author: string;
  authorId: string;
  submittedAt: string;
  dueDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  currentStep: number;
  totalSteps: number;
  currentApprover: string;
  category: string;
  isUrgent: boolean;
  documentId: string;
}

// 통계 타입
interface ApprovalStats {
  totalPending: number;
  myPending: number;
  approvedToday: number;
  overdue: number;
  averageTime: number;
  completionRate: number;
}

export default function ApprovalsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 결재 데이터 로드
  useEffect(() => {
    const loadApprovalsData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // 사용자 권한에 따라 통계 조회 방식 결정
        const isAdmin = user.roles?.some(role => role === 'ADMIN' || role === 'SUPER_ADMIN');
        
        let statsResponse;
        if (isAdmin) {
          // 관리자/슈퍼관리자: 전체 시스템 통계
          statsResponse = await dashboardApi.getDashboardStats();
        } else {
          // 일반 사용자: 사용자별 통계
          statsResponse = await dashboardApi.getDashboardStatsByUser(user.id);
        }

        if (statsResponse.success && statsResponse.data) {
          const statsData = statsResponse.data;
          
          setStats({
            totalPending: statsData.pendingApprovals || 0,
            myPending: statsData.pendingApprovals || 0,
            approvedToday: statsData.approvedDocuments || 0,
            overdue: 0, // 나중에 구현
            averageTime: 0, // 나중에 구현
            completionRate: 0, // 나중에 구현
          });
        }

        // 결재 대기 목록 조회
        const pendingApprovalsResponse = await dashboardApi.getPendingApprovals();
        if (pendingApprovalsResponse.success && pendingApprovalsResponse.data) {
          const approvalItems: ApprovalItem[] = pendingApprovalsResponse.data.map(doc => ({
            id: doc.documentId || doc.id,
            title: doc.documentTitle || doc.title,
            author: doc.authorName || '알 수 없음',
            authorId: doc.authorId || '',
            submittedAt: doc.submittedAt || new Date().toISOString(),
            dueDate: doc.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'PENDING' as const,
            priority: (doc.priority || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
            currentStep: 1, // 임시값
            totalSteps: 1, // 임시값
            currentApprover: doc.approverName || '알 수 없음',
            category: doc.documentType || '일반',
            isUrgent: doc.priority === 'HIGH',
            documentId: doc.documentId || doc.id
          }));
          setApprovals(approvalItems);
        }
      } catch (error) {
        console.error('결재 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApprovalsData();
  }, [user]);

  // 필터링된 결재 목록
  const filteredApprovals = approvals.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 상태별 색상 매핑
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    OVERDUE: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    PENDING: '대기중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    OVERDUE: '지연됨',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-600',
    MEDIUM: 'bg-yellow-100 text-yellow-600',
    HIGH: 'bg-red-100 text-red-600',
  };

  const priorityLabels: Record<string, string> = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
  };

  // 결재 액션 처리
  const handleApprovalAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      // 문서 상세 정보 조회
      const documentResponse = await documentApi.getDocument(id);
      if (!documentResponse.success || !documentResponse.data) {
        console.error('문서 조회 실패');
        return;
      }

      const document = documentResponse.data;
      
      // 현재 사용자의 대기 중인 결재단계 찾기
      const findPendingApprovalStepForUser = (document: any, userId: string) => {
        if (!document.approvalLines) return null;
        
        for (const approvalLine of document.approvalLines) {
          if (approvalLine.approvalSteps) {
            for (const step of approvalLine.approvalSteps) {
              if (step.approverId === userId && step.status === 'PENDING') {
                return step;
              }
            }
          }
        }
        return null;
      };

      const pendingStep = findPendingApprovalStepForUser(document, user?.id || '');
      if (!pendingStep) {
        console.error('결재할 수 있는 단계가 없습니다');
        return;
      }

      // 결재 액션 API 호출
      const { approvalApi } = await import('@/services/approvalApi');
      const { ApprovalAction } = await import('@/types');
      
      const actionRequest = {
        action: action === 'approve' ? ApprovalAction.APPROVE : ApprovalAction.REJECT,
        comments: action === 'approve' ? '승인합니다.' : '반려합니다.'
      };

      const response = await approvalApi.processApproval(pendingStep.id, actionRequest);
      
      if (response.success) {
        // 성공 시 목록 새로고침
        window.location.reload();
      } else {
        console.error('결재 처리 실패:', response.message);
      }
    } catch (error) {
      console.error('결재 액션 처리 실패:', error);
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'title',
      title: '제목',
      dataIndex: 'title',
      render: (value: any, record: ApprovalItem) => (
        <div className="space-y-1">
          <Link 
            href={`/documents/${record.documentId}`}
            className="font-medium text-primary hover:underline"
          >
            {record.title}
          </Link>
          <div className="text-sm text-muted-foreground">
            {record.category} • {record.author}
          </div>
          {record.isUrgent && (
            <Badge variant="destructive" className="text-xs">
              긴급
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '상태',
      dataIndex: 'status',
      render: (value: any, record: ApprovalItem) => (
        <Badge className={statusColors[record.status]}>
          {statusLabels[record.status]}
        </Badge>
      ),
    },
    {
      key: 'priority',
      title: '우선순위',
      dataIndex: 'priority',
      render: (value: any, record: ApprovalItem) => (
        <Badge variant="outline" className={priorityColors[record.priority]}>
          {priorityLabels[record.priority]}
        </Badge>
      ),
    },
    {
      key: 'progress',
      title: '진행률',
      dataIndex: 'progress',
      render: (value: any, record: ApprovalItem) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  record.status === 'OVERDUE' ? 'bg-red-500' :
                  record.status === 'APPROVED' ? 'bg-green-500' :
                  record.status === 'REJECTED' ? 'bg-red-500' :
                  'bg-primary'
                }`}
                style={{ width: `${(record.currentStep / record.totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {record.currentStep}/{record.totalSteps}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            현재: {record.currentApprover}
          </p>
        </div>
      ),
    },
    {
      key: 'dueDate',
      title: '마감일',
      dataIndex: 'dueDate',
      render: (value: any, record: ApprovalItem) => {
        const dueDate = new Date(record.dueDate);
        const now = new Date();
        const isOverdue = dueDate < now && record.status === 'PENDING';
        
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
            {dueDate.toLocaleDateString('ko-KR')}
            {isOverdue && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">지연</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: '작업',
      dataIndex: 'actions',
      render: (value: any, record: ApprovalItem) => (
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/documents/${record.documentId}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleApprovalAction(record.id, 'approve')}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleApprovalAction(record.id, 'reject')}
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">결재 목록을 불러오는 중...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">결재 관리</h1>
            <p className="text-muted-foreground">
              결재 대기 목록을 확인하고 처리하세요
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="전체 대기"
            value={stats?.totalPending || 0}
            icon={Clock}
            trend={{
              value: 8,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="내 결재"
            value={stats?.myPending || 0}
            icon={User}
            trend={{
              value: 12,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="오늘 승인"
            value={stats?.approvedToday || 0}
            icon={CheckCircle}
            trend={{
              value: 15,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="지연된 항목"
            value={stats?.overdue || 0}
            icon={AlertTriangle}
            trend={{
              value: 5,
              label: "지난 주 대비",
              type: "decrease"
            }}
          />
        </div>

        {/* 추가 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>평균 처리 시간</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageTime || 0}일</div>
              <p className="text-sm text-muted-foreground">
                최근 30일 평균 결재 처리 시간
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5" />
                <span>완료율</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
              <p className="text-sm text-muted-foreground">
                마감일 내 결재 완료율
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>결재 검색 및 필터</CardTitle>
            <CardDescription>
              결재 항목을 검색하고 상태별로 필터링하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="제목, 작성자로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 필터 */}
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">전체 상태</option>
                  <option value="PENDING">대기중</option>
                  <option value="APPROVED">승인됨</option>
                  <option value="REJECTED">반려됨</option>
                  <option value="OVERDUE">지연됨</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">전체 우선순위</option>
                  <option value="HIGH">높음</option>
                  <option value="MEDIUM">보통</option>
                  <option value="LOW">낮음</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결재 목록 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>결재 목록</CardTitle>
            <CardDescription>
              총 {filteredApprovals.length}개의 결재 항목이 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredApprovals}
              columns={columns}
              searchable={false}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50]
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
