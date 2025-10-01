'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { approvalApi } from '@/services/approvalApi';
import Link from 'next/link';

// 결재 이력 항목 타입
interface ApprovalHistoryItem {
  id: string;
  action: 'APPROVE' | 'REJECT' | 'DELEGATE' | 'RETURN';
  comment?: string;
  approverName: string;
  approverDisplayName: string;
  documentId: string;
  documentTitle: string;
  actionAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export default function ApprovalHistoryPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // 결재 이력 데이터 로드
  useEffect(() => {
    const loadApprovalHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await approvalApi.getMyProcessedApprovals({
          page: 0,
          size: 100
        });

        if (response.success && response.data) {
          const historyItems: ApprovalHistoryItem[] = response.data.content.map(item => ({
            id: item.id,
            action: item.action as 'APPROVE' | 'REJECT' | 'DELEGATE' | 'RETURN',
            comment: item.comments,
            approverName: item.approverName || '알 수 없음',
            approverDisplayName: item.approverDisplayName || '알 수 없음',
            documentId: item.documentId || '',
            documentTitle: item.documentTitle || '알 수 없음',
            actionAt: item.actionAt || new Date().toISOString(),
            ipAddress: item.ipAddress,
            userAgent: item.userAgent
          }));
          setHistory(historyItems);
        }
      } catch (error) {
        console.error('결재 이력 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApprovalHistory();
  }, [user]);

  // 필터링된 결재 이력
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.approverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || item.action === actionFilter;
    
    // 날짜 필터 (최근 7일, 30일, 90일)
    const itemDate = new Date(item.actionAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let matchesDate = true;
    if (dateFilter === '7DAYS') {
      matchesDate = daysDiff <= 7;
    } else if (dateFilter === '30DAYS') {
      matchesDate = daysDiff <= 30;
    } else if (dateFilter === '90DAYS') {
      matchesDate = daysDiff <= 90;
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  // 액션별 색상 매핑
  const actionColors: Record<string, string> = {
    APPROVE: 'bg-green-100 text-green-800',
    REJECT: 'bg-red-100 text-red-800',
    DELEGATE: 'bg-blue-100 text-blue-800',
    RETURN: 'bg-yellow-100 text-yellow-800',
  };

  const actionLabels: Record<string, string> = {
    APPROVE: '승인',
    REJECT: '반려',
    DELEGATE: '위임',
    RETURN: '반송',
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'document',
      title: '문서',
      dataIndex: 'document',
      render: (value: any, record: ApprovalHistoryItem) => (
        <div className="space-y-1">
          <Link 
            href={`/documents/${record.documentId}`}
            className="font-medium text-primary hover:underline"
          >
            {record.documentTitle}
          </Link>
          <div className="text-sm text-muted-foreground">
            문서 ID: {record.documentId.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      title: '액션',
      dataIndex: 'action',
      render: (value: any, record: ApprovalHistoryItem) => (
        <Badge className={actionColors[record.action]}>
          {actionLabels[record.action]}
        </Badge>
      ),
    },
    {
      key: 'comment',
      title: '의견',
      dataIndex: 'comment',
      render: (value: any, record: ApprovalHistoryItem) => (
        <div className="max-w-xs">
          <p className="text-sm truncate" title={record.comment}>
            {record.comment || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'approver',
      title: '처리자',
      dataIndex: 'approver',
      render: (value: any, record: ApprovalHistoryItem) => (
        <div className="space-y-1">
          <p className="font-medium">{record.approverDisplayName}</p>
          <p className="text-sm text-muted-foreground">{record.approverName}</p>
        </div>
      ),
    },
    {
      key: 'actionAt',
      title: '처리일시',
      dataIndex: 'actionAt',
      render: (value: any, record: ApprovalHistoryItem) => {
        const actionDate = new Date(record.actionAt);
        return (
          <div className="space-y-1">
            <p className="text-sm">{actionDate.toLocaleDateString('ko-KR')}</p>
            <p className="text-xs text-muted-foreground">{actionDate.toLocaleTimeString('ko-KR')}</p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: '작업',
      dataIndex: 'actions',
      render: (value: any, record: ApprovalHistoryItem) => (
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/documents/${record.documentId}`}>
              <Eye className="h-4 w-4" />
            </Link>
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
            <p className="text-muted-foreground">결재 이력을 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">결재 이력</h1>
            <p className="text-muted-foreground">
              내가 처리한 결재 이력을 확인하세요
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">승인</p>
                  <p className="text-2xl font-bold">{history.filter(h => h.action === 'APPROVE').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">반려</p>
                  <p className="text-2xl font-bold">{history.filter(h => h.action === 'REJECT').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">위임</p>
                  <p className="text-2xl font-bold">{history.filter(h => h.action === 'DELEGATE').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">반송</p>
                  <p className="text-2xl font-bold">{history.filter(h => h.action === 'RETURN').length}</p>
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
              결재 이력을 검색하고 필터링하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="문서명, 의견, 처리자로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 필터 */}
              <div className="flex gap-2">
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">전체 액션</option>
                  <option value="APPROVE">승인</option>
                  <option value="REJECT">반려</option>
                  <option value="DELEGATE">위임</option>
                  <option value="RETURN">반송</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">전체 기간</option>
                  <option value="7DAYS">최근 7일</option>
                  <option value="30DAYS">최근 30일</option>
                  <option value="90DAYS">최근 90일</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결재 이력 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>결재 이력 목록</CardTitle>
            <CardDescription>
              총 {filteredHistory.length}개의 결재 이력이 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredHistory}
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
