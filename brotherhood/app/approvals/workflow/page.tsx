'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi } from '@/services/dashboardApi';
import Link from 'next/link';

// 워크플로우 항목 타입
interface WorkflowItem {
  id: string;
  documentId: string;
  documentTitle: string;
  currentStep: string;
  currentApprover: string;
  startedAt: string;
  estimatedCompletion?: string;
  isOverdue: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  totalSteps: number;
  completedSteps: number;
  author: string;
  category: string;
}

export default function WorkflowPage() {
  const { user } = useAuthStore();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // 워크플로우 데이터 로드
  useEffect(() => {
    const loadWorkflowData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // 워크플로우 현황 조회 (임시로 결재 대기 목록 사용)
        const response = await dashboardApi.getPendingApprovals();
        if (response.success && response.data) {
          const workflowItems: WorkflowItem[] = response.data.map(doc => ({
            id: doc.documentId || doc.id,
            documentId: doc.documentId || doc.id,
            documentTitle: doc.documentTitle,
            currentStep: '1단계', // 임시값
            currentApprover: '알 수 없음',  // PendingApprovalItem에 approverName 필드 없음
            startedAt: doc.submittedAt || new Date().toISOString(),
            estimatedCompletion: doc.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isOverdue: false, // 임시값
            status: 'ACTIVE' as const,
            priority: (doc.priority || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
            totalSteps: 1, // 임시값
            completedSteps: 0, // 임시값
            author: doc.authorName || '알 수 없음',
            category: doc.documentType || '일반'
          }));
          setWorkflows(workflowItems);
        }
      } catch (error) {
        console.error('워크플로우 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflowData();
  }, [user]);

  // 필터링된 워크플로우
  const filteredWorkflows = workflows.filter(item => {
    const matchesSearch = item.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.currentApprover.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 상태별 색상 매핑
  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소',
    PAUSED: '일시정지',
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

  // 워크플로우 액션 처리
  const handleWorkflowAction = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    console.log(`워크플로우 ${action}:`, id);
    // 실제로는 API 호출
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'document',
      title: '문서',
      dataIndex: 'document',
      render: (value: any, record: WorkflowItem) => (
        <div className="space-y-1">
          <Link 
            href={`/documents/${record.documentId}`}
            className="font-medium text-primary hover:underline"
          >
            {record.documentTitle}
          </Link>
          <div className="text-sm text-muted-foreground">
            {record.category} • {record.author}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '상태',
      dataIndex: 'status',
      render: (value: any, record: WorkflowItem) => (
        <Badge className={statusColors[record.status]}>
          {statusLabels[record.status]}
        </Badge>
      ),
    },
    {
      key: 'priority',
      title: '우선순위',
      dataIndex: 'priority',
      render: (value: any, record: WorkflowItem) => (
        <Badge variant="outline" className={priorityColors[record.priority]}>
          {priorityLabels[record.priority]}
        </Badge>
      ),
    },
    {
      key: 'progress',
      title: '진행률',
      dataIndex: 'progress',
      render: (value: any, record: WorkflowItem) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-primary"
                style={{ width: `${(record.completedSteps / record.totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {record.completedSteps}/{record.totalSteps}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            현재: {record.currentApprover}
          </p>
        </div>
      ),
    },
    {
      key: 'currentStep',
      title: '현재 단계',
      dataIndex: 'currentStep',
      render: (value: any, record: WorkflowItem) => (
        <div className="space-y-1">
          <p className="text-sm font-medium">{record.currentStep}</p>
          <p className="text-xs text-muted-foreground">
            담당자: {record.currentApprover}
          </p>
        </div>
      ),
    },
    {
      key: 'timeline',
      title: '타임라인',
      dataIndex: 'timeline',
      render: (value: any, record: WorkflowItem) => {
        const startDate = new Date(record.startedAt);
        const estimatedDate = record.estimatedCompletion ? new Date(record.estimatedCompletion) : null;
        const isOverdue = estimatedDate && estimatedDate < new Date();
        
        return (
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">시작:</span> {startDate.toLocaleDateString('ko-KR')}
            </div>
            {estimatedDate && (
              <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <span className="text-muted-foreground">예상완료:</span> {estimatedDate.toLocaleDateString('ko-KR')}
                {isOverdue && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">지연</span>
                  </div>
                )}
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
      render: (value: any, record: WorkflowItem) => (
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/documents/${record.documentId}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {record.status === 'ACTIVE' && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleWorkflowAction(record.id, 'pause')}
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleWorkflowAction(record.id, 'cancel')}
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
          {record.status === 'PAUSED' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleWorkflowAction(record.id, 'resume')}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
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
            <p className="text-muted-foreground">워크플로우 데이터를 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">결재 워크플로우</h1>
            <p className="text-muted-foreground">
              진행 중인 결재 프로세스를 모니터링하고 관리하세요
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">진행중</p>
                  <p className="text-2xl font-bold">{workflows.filter(w => w.status === 'ACTIVE').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">완료</p>
                  <p className="text-2xl font-bold">{workflows.filter(w => w.status === 'COMPLETED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Pause className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">일시정지</p>
                  <p className="text-2xl font-bold">{workflows.filter(w => w.status === 'PAUSED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">지연</p>
                  <p className="text-2xl font-bold">{workflows.filter(w => w.isOverdue).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>검색 및 필터</CardTitle>
            <CardDescription>
              워크플로우를 검색하고 필터링하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="문서명, 작성자, 담당자로 검색..."
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
                  <option value="ACTIVE">진행중</option>
                  <option value="COMPLETED">완료</option>
                  <option value="PAUSED">일시정지</option>
                  <option value="CANCELLED">취소</option>
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

        {/* 워크플로우 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>워크플로우 목록</CardTitle>
            <CardDescription>
              총 {filteredWorkflows.length}개의 워크플로우가 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredWorkflows}
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
