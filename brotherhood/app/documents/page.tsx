'use client';

// Next.js 동적 렌더링 강제 (useSearchParams 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/DataTable';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { documentApi } from '@/services/documentApi';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// 문서 상태 타입
type DocumentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

// 문서 타입
interface Document {
  id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  author: string;
  authorId: string;
  authorName?: string;
  authorDisplayName?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  documentType?: string;
  tags: string[];
  attachmentCount: number;
  approvalProgress: number;
}

// 상태별 색상 매핑
const statusColors: Record<DocumentStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-blue-100 text-blue-800',
};

// 상태별 한글명
const statusLabels: Record<DocumentStatus, string> = {
  DRAFT: '초안',
  PENDING: '검토중',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
  ARCHIVED: '보관됨',
};

// 우선순위별 색상
const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-600',
  HIGH: 'bg-red-100 text-red-600',
};

// 우선순위별 한글명
const priorityLabels: Record<string, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
};

export default function DocumentsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const toastShownRef = useRef(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 문서 목록 새로고침 함수
  const refreshDocuments = () => {
    setRefreshTrigger(prev => prev + 1);
    toastShownRef.current = false; // 토스트 다시 표시 가능하도록 리셋
  };

  // 문서 삭제 함수
  const handleDeleteDocument = async (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인 함수
  const confirmDelete = async () => {
    if (!documentToDelete) return;

    setDeleting(true);
    try {
      await documentApi.deleteDocument(documentToDelete.id);
      toast({
        title: '문서 삭제 완료',
        description: '문서가 성공적으로 삭제되었습니다.',
        variant: 'success',
      });
      refreshDocuments();
    } catch (error: any) {
      console.error('문서 삭제 오류:', error);
      toast({
        title: '삭제 실패',
        description: error.response?.data?.message || '문서 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  // 삭제 취소 함수
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  // 삭제 가능 여부 확인
  const canDelete = (document: Document) => {
    if (!user) return false;
    
    // 작성자이거나 관리자인지 확인
    const isAuthor = document.authorId === user.id;
    const isAdmin = user.roles?.some(role => role === 'ADMIN' || role === 'SUPER_ADMIN');
    
    // DRAFT 또는 REJECTED 상태만 삭제 가능
    const isDeletableStatus = document.status === 'DRAFT' || document.status === 'REJECTED';
    
    return (isAuthor || isAdmin) && isDeletableStatus;
  };

  // URL 파라미터 확인하여 새로고침 트리거
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('refresh') === 'true') {
        refreshDocuments();
        // URL에서 refresh 파라미터 제거
        url.searchParams.delete('refresh');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  // 실제 API에서 문서 목록 조회
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        console.log('문서 목록 API 호출 시작...');
        
        // documentApi 서비스 사용
        const result = await documentApi.getDocuments();
        
        console.log('문서 목록 API 응답:', result);
        
        if (result.success && result.data) {
          console.log('실제 데이터 로드 성공:', result.data.content?.length || 0, '개');
          setDocuments(result.data.content as any || []);
        } else {
          console.error('문서 목록 조회 실패:', result.message);
          console.log('API 실패 - 빈 배열 설정');
          setDocuments([]);
        }
      } catch (error) {
        console.error('문서 목록 조회 중 오류:', error);
        console.log('API 오류 - 빈 배열 설정');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    const generateTestDocuments = (): Document[] => {
      const categories = ['회의록', '보고서', '제안서', '계획서', '결과보고서'];
      const tags = ['긴급', '중요', '일반', '검토필요', '승인대기'];
      const authors = ['김철수', '이영희', '박민수', '정수진', '최영호'];
      
      return Array.from({ length: 25 }, (_, index) => ({
        id: `doc-${index + 1}`,
        title: `${categories[index % categories.length]} ${index + 1}`,
        content: `문서 내용 ${index + 1}...`,
        status: (['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'][index % 5]) as DocumentStatus,
        author: authors[index % authors.length],
        authorId: `user-${index % 5 + 1}`,
        authorName: authors[index % authors.length],
        authorDisplayName: `${authors[index % authors.length]} (${index % 5 + 1}번 사용자)`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        priority: (['LOW', 'MEDIUM', 'HIGH'][index % 3]) as 'LOW' | 'MEDIUM' | 'HIGH',
        category: categories[index % categories.length],
        documentType: categories[index % categories.length],
        tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
        attachmentCount: Math.floor(Math.random() * 5),
        approvalProgress: Math.floor(Math.random() * 101),
      }));
    };

    fetchDocuments();
  }, [refreshTrigger]); // refreshTrigger가 변경될 때마다 실행

  // 문서 로드 완료 토스트 표시 (한 번만 실행)
  useEffect(() => {
    if (!loading && documents.length > 0 && !toastShownRef.current) {
      toastShownRef.current = true;
      toast({
        title: "문서 목록 로드 완료",
        description: `${documents.length}개의 문서를 불러왔습니다.`,
        variant: "success"
      });
    }
  }, [loading, documents.length]);

  // 필터링된 문서 목록
  const filteredDocuments = documents.filter(doc => {
    if (!doc) return false;
    
    const matchesSearch = (doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         (doc.content?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         (doc.author?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || doc.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 통계 계산
  const stats = {
    total: documents.length,
    draft: documents.filter(d => d && d.status === 'DRAFT').length,
    pending: documents.filter(d => d && d.status === 'PENDING').length,
    approved: documents.filter(d => d && d.status === 'APPROVED').length,
    rejected: documents.filter(d => d && d.status === 'REJECTED').length,
  };

  // 테이블 컬럼 정의
  const columns: Column<Document>[] = [
    {
      key: 'title',
      title: '제목',
      dataIndex: 'title',
      render: (value: any, doc: Document) => {
        if (!doc) return <div>문서 정보 없음</div>;
        
        return (
          <div className="space-y-1">
            <Link 
              href={`/documents/${doc.id}`}
              className="font-medium text-primary hover:underline"
            >
              {doc.title || '제목 없음'}
            </Link>
            <div className="text-sm text-muted-foreground flex items-center space-x-1">
              <span>{doc.documentType || doc.category || '분류 없음'}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{doc.authorDisplayName || doc.authorName || doc.author || '작성자 없음'}</span>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: '상태',
      dataIndex: 'status',
      render: (value: any, doc: Document) => {
        if (!doc || !doc.status) return <Badge>상태 없음</Badge>;
        
        return (
          <Badge className={statusColors[doc.status] || 'bg-gray-100 text-gray-800'}>
            {statusLabels[doc.status] || doc.status}
          </Badge>
        );
      },
    },
    {
      key: 'priority',
      title: '우선순위',
      dataIndex: 'priority',
      render: (value: any, doc: Document) => {
        if (!doc || !doc.priority) return <Badge variant="outline">우선순위 없음</Badge>;
        
        return (
          <Badge variant="outline" className={priorityColors[doc.priority] || 'bg-gray-100 text-gray-600'}>
            {priorityLabels[doc.priority] || doc.priority}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      title: '작성일',
      dataIndex: 'createdAt',
      render: (value: any, doc: Document) => {
        if (!doc || !doc.createdAt) return <div className="text-sm">날짜 없음</div>;
        
        try {
          return (
            <div className="text-sm">
              {new Date(doc.createdAt).toLocaleDateString('ko-KR')}
            </div>
          );
        } catch (error) {
          return <div className="text-sm">날짜 오류</div>;
        }
      },
    },
    {
      key: 'progress',
      title: '진행률',
      dataIndex: 'approvalProgress',
      render: (value: any, doc: Document) => {
        if (!doc) return <div className="text-sm">진행률 없음</div>;
        
        const progress = doc.approvalProgress || 0;
        const safeProgress = Math.max(0, Math.min(100, progress));
        
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${safeProgress}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {safeProgress}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: '액션',
      dataIndex: 'actions',
      render: (value: any, doc: Document) => {
        if (!doc) return null;
        
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href={`/documents/${doc.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {canDelete(doc) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteDocument(doc)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">문서 목록을 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">문서 관리</h1>
            <p className="text-muted-foreground">
              문서 목록을 확인하고 관리하세요
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={refreshDocuments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
            <Button asChild>
              <Link href="/documents/create">
                <Plus className="mr-2 h-4 w-4" />
                새 문서 작성
              </Link>
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="전체 문서"
            value={stats.total}
            icon={FileText}
            trend={{
              value: 12,
              label: "지난 달 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="초안"
            value={stats.draft}
            icon={Edit}
            trend={{
              value: 5,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="검토중"
            value={stats.pending}
            icon={Clock}
            trend={{
              value: 8,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="승인됨"
            value={stats.approved}
            icon={CheckCircle}
            trend={{
              value: 15,
              label: "지난 달 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="반려됨"
            value={stats.rejected}
            icon={XCircle}
            trend={{
              value: 3,
              label: "지난 주 대비",
              type: "decrease"
            }}
          />
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>문서 검색 및 필터</CardTitle>
            <CardDescription>
              문서를 검색하고 상태별로 필터링하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="제목, 내용, 작성자로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 min-h-[44px]"
                  />
                </div>
              </div>

              {/* 상태 필터 */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'ALL')}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[44px]"
                >
                  <option value="ALL">전체 상태</option>
                  <option value="DRAFT">초안</option>
                  <option value="PENDING">검토중</option>
                  <option value="APPROVED">승인됨</option>
                  <option value="REJECTED">반려됨</option>
                  <option value="ARCHIVED">보관됨</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[44px]"
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

        {/* 문서 목록 - 데스크톱 테이블 / 모바일 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>문서 목록</CardTitle>
            <CardDescription>
              총 {filteredDocuments.length}개의 문서가 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 데스크톱 테이블 */}
            <div className="hidden md:block">
              <DataTable
                data={filteredDocuments}
                columns={columns}
                searchable={false} // 이미 상단에서 검색 기능 제공
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50]
                }}
              />
            </div>

            {/* 모바일 카드 리스트 */}
            <div className="block md:hidden space-y-3">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                  {/* 제목과 상태 */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm leading-tight flex-1 pr-2">
                      {document.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge variant="outline" className={statusColors[document.status]}>
                        {statusLabels[document.status]}
                      </Badge>
                      {document.priority && (
                        <Badge variant="outline" className={priorityColors[document.priority]}>
                          {priorityLabels[document.priority]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 작성자와 날짜 */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{document.authorDisplayName || document.authorName || '알 수 없음'}</span>
                    <span>{new Date(document.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>

                  {/* 분류 */}
                  {(document as any).classification && (
                    <div className="text-xs text-muted-foreground">
                      분류: {(document as any).classification}
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/documents/${document.id}`)}
                      className="h-8 px-2 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      보기
                    </Button>
                    {document.status === 'DRAFT' && document.authorId === user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/documents/${document.id}/edit`)}
                        className="h-8 px-2 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        수정
                      </Button>
                    )}
                    {document.authorId === user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document)}
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        삭제
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="문서 삭제 확인"
        description={
          documentToDelete 
            ? `"${documentToDelete.title}" 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : ''
        }
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={deleting}
        variant="destructive"
      />
    </AppLayout>
  );
}
