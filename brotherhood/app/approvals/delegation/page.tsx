'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserCheck, 
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
  Plus,
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/services/userApi';
import { approvalApi } from '@/services/approvalApi';
import Link from 'next/link';

// 위임 항목 타입
interface DelegationItem {
  id: string;
  documentId: string;
  documentTitle: string;
  originalApprover: string;
  originalApproverDisplayName: string;
  delegatedTo: string;
  delegatedToDisplayName: string;
  delegatedAt: string;
  reason: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt?: string;
  isExpired: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  currentStep: string;
}

export default function DelegationPage() {
  const { user } = useAuthStore();
  const [delegations, setDelegations] = useState<DelegationItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showDelegationForm, setShowDelegationForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [delegationForm, setDelegationForm] = useState({
    delegatedTo: '',
    reason: '',
    expiresAt: ''
  });

  // 위임 데이터 로드
  useEffect(() => {
    const loadDelegationData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // 사용자 목록 조회
        const usersResponse = await userApi.getUsers();
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data.content);
        }

        // 위임 목록 조회 (임시 데이터)
        const mockDelegations: DelegationItem[] = [
          {
            id: '1',
            documentId: 'd230113d-04fc-4709-8b31-4ac291845ca0',
            documentTitle: '휴가 신청서',
            originalApprover: 'admin',
            originalApproverDisplayName: '관리자',
            delegatedTo: 'user1',
            delegatedToDisplayName: '김철수',
            delegatedAt: new Date().toISOString(),
            reason: '휴가 중으로 인한 위임',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isExpired: false,
            priority: 'MEDIUM',
            currentStep: '1단계'
          }
        ];
        setDelegations(mockDelegations);
      } catch (error) {
        console.error('위임 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDelegationData();
  }, [user]);

  // 필터링된 위임 목록
  const filteredDelegations = delegations.filter(item => {
    const matchesSearch = item.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.originalApproverDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.delegatedToDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 상태별 색상 매핑
  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: '활성',
    COMPLETED: '완료',
    CANCELLED: '취소',
    EXPIRED: '만료',
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

  // 위임 처리
  const handleDelegation = async () => {
    if (!delegationForm.delegatedTo || !delegationForm.reason) {
      alert('위임 대상과 사유를 입력해주세요.');
      return;
    }

    try {
      // 실제로는 API 호출
      console.log('위임 처리:', delegationForm);
      setShowDelegationForm(false);
      setDelegationForm({ delegatedTo: '', reason: '', expiresAt: '' });
    } catch (error) {
      console.error('위임 처리 실패:', error);
    }
  };

  // 위임 취소
  const handleCancelDelegation = async (id: string) => {
    try {
      // 실제로는 API 호출
      console.log('위임 취소:', id);
    } catch (error) {
      console.error('위임 취소 실패:', error);
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'document',
      title: '문서',
      dataIndex: 'document',
      render: (value: any, record: DelegationItem) => (
        <div className="space-y-1">
          <Link 
            href={`/documents/${record.documentId}`}
            className="font-medium text-primary hover:underline"
          >
            {record.documentTitle}
          </Link>
          <div className="text-sm text-muted-foreground">
            {record.currentStep}
          </div>
        </div>
      ),
    },
    {
      key: 'delegation',
      title: '위임 정보',
      dataIndex: 'delegation',
      render: (value: any, record: DelegationItem) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">From:</span>
            <span className="text-sm font-medium">{record.originalApproverDisplayName}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-medium">{record.delegatedToDisplayName}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-xs" title={record.reason}>
            {record.reason}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      title: '상태',
      dataIndex: 'status',
      render: (value: any, record: DelegationItem) => (
        <div className="space-y-1">
          <Badge className={statusColors[record.status]}>
            {statusLabels[record.status]}
          </Badge>
          {record.isExpired && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-500">만료됨</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      title: '우선순위',
      dataIndex: 'priority',
      render: (value: any, record: DelegationItem) => (
        <Badge variant="outline" className={priorityColors[record.priority]}>
          {priorityLabels[record.priority]}
        </Badge>
      ),
    },
    {
      key: 'timeline',
      title: '타임라인',
      dataIndex: 'timeline',
      render: (value: any, record: DelegationItem) => {
        const delegatedDate = new Date(record.delegatedAt);
        const expiresDate = record.expiresAt ? new Date(record.expiresAt) : null;
        const isExpired = expiresDate && expiresDate < new Date();
        
        return (
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">위임일:</span> {delegatedDate.toLocaleDateString('ko-KR')}
            </div>
            {expiresDate && (
              <div className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                <span className="text-muted-foreground">만료일:</span> {expiresDate.toLocaleDateString('ko-KR')}
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
      render: (value: any, record: DelegationItem) => (
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/documents/${record.documentId}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {record.status === 'ACTIVE' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleCancelDelegation(record.id)}
            >
              <XCircle className="h-4 w-4 text-red-600" />
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
            <p className="text-muted-foreground">위임 데이터를 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">결재 위임</h1>
            <p className="text-muted-foreground">
              결재 권한을 위임하고 관리하세요
            </p>
          </div>
          <Button onClick={() => setShowDelegationForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            위임하기
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">활성 위임</p>
                  <p className="text-2xl font-bold">{delegations.filter(d => d.status === 'ACTIVE').length}</p>
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
                  <p className="text-2xl font-bold">{delegations.filter(d => d.status === 'COMPLETED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">취소</p>
                  <p className="text-2xl font-bold">{delegations.filter(d => d.status === 'CANCELLED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">만료</p>
                  <p className="text-2xl font-bold">{delegations.filter(d => d.isExpired).length}</p>
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
              위임 목록을 검색하고 필터링하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="문서명, 위임자, 수임자, 사유로 검색..."
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
                  <option value="ACTIVE">활성</option>
                  <option value="COMPLETED">완료</option>
                  <option value="CANCELLED">취소</option>
                  <option value="EXPIRED">만료</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 위임 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>위임 목록</CardTitle>
            <CardDescription>
              총 {filteredDelegations.length}개의 위임이 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredDelegations}
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

        {/* 위임 폼 모달 */}
        {showDelegationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>결재 위임</CardTitle>
                <CardDescription>
                  결재 권한을 다른 사용자에게 위임합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">위임 대상</label>
                  <select
                    value={delegationForm.delegatedTo}
                    onChange={(e) => setDelegationForm({ ...delegationForm, delegatedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">선택하세요</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.displayName || user.name} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">위임 사유</label>
                  <Input
                    placeholder="위임 사유를 입력하세요"
                    value={delegationForm.reason}
                    onChange={(e) => setDelegationForm({ ...delegationForm, reason: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">만료일 (선택사항)</label>
                  <Input
                    type="datetime-local"
                    value={delegationForm.expiresAt}
                    onChange={(e) => setDelegationForm({ ...delegationForm, expiresAt: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDelegationForm(false)}
                  >
                    취소
                  </Button>
                  <Button onClick={handleDelegation}>
                    위임하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
