'use client';

import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { StatCard } from '@/components/StatCard';
import { DataTable, Column } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// 샘플 데이터
const sampleDocuments = [
  {
    id: 1,
    title: '2024년 1분기 예산 계획서',
    status: 'approved',
    author: '김철수',
    department: '경영지원팀',
    createdAt: '2024-09-19',
    priority: 'high'
  },
  {
    id: 2,
    title: '신규 직원 채용 계획',
    status: 'pending',
    author: '이영희',
    department: '인사팀',
    createdAt: '2024-09-18',
    priority: 'medium'
  },
  {
    id: 3,
    title: '시스템 업그레이드 계획',
    status: 'rejected',
    author: '박민수',
    department: 'IT팀',
    createdAt: '2024-09-17',
    priority: 'high'
  },
  {
    id: 4,
    title: '사무실 임대 계약서',
    status: 'draft',
    author: '정수진',
    department: '총무팀',
    createdAt: '2024-09-16',
    priority: 'low'
  },
  {
    id: 5,
    title: '보안 정책 개정안',
    status: 'approved',
    author: '최보안',
    department: '보안팀',
    createdAt: '2024-09-15',
    priority: 'high'
  }
];

const documentColumns: Column<typeof sampleDocuments[0]>[] = [
  {
    key: 'title',
    title: '문서 제목',
    dataIndex: 'title',
    sortable: true,
    filterable: true,
  },
  {
    key: 'status',
    title: '상태',
    dataIndex: 'status',
    render: (value) => {
      const statusConfig = {
        approved: { label: '승인', variant: 'default' as const, icon: '✅' },
        pending: { label: '대기', variant: 'secondary' as const, icon: '⏳' },
        rejected: { label: '반려', variant: 'destructive' as const, icon: '❌' },
        draft: { label: '임시저장', variant: 'outline' as const, icon: '📝' },
      };
      const config = statusConfig[value as keyof typeof statusConfig];
      return (
        <div className="flex items-center space-x-2">
          <span>{config.icon}</span>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      );
    },
    sortable: true,
  },
  {
    key: 'priority',
    title: '우선순위',
    dataIndex: 'priority',
    render: (value) => {
      const priorityConfig = {
        high: { label: '높음', variant: 'destructive' as const },
        medium: { label: '보통', variant: 'default' as const },
        low: { label: '낮음', variant: 'secondary' as const },
      };
      const config = priorityConfig[value as keyof typeof priorityConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    sortable: true,
  },
  {
    key: 'author',
    title: '작성자',
    dataIndex: 'author',
    sortable: true,
  },
  {
    key: 'department',
    title: '부서',
    dataIndex: 'department',
    sortable: true,
  },
  {
    key: 'createdAt',
    title: '작성일',
    dataIndex: 'createdAt',
    sortable: true,
  },
];

export default function DemoPage() {
  const { isAuthenticated } = useAuthStore();

  // initTestUser 제거 - 자동 로그인 비활성화

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Brotherhood 결재 시스템</h1>
          <p className="text-muted-foreground">
            핵심 공통 컴포넌트 데모 페이지입니다.
          </p>
        </div>

        {/* 통계 카드 섹션 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">대시보드 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="총 문서 수"
              value="1,247"
              description="전체 등록된 문서"
              icon={FileText}
              trend={{ value: 12, label: '전월 대비', type: 'increase' }}
              variant="info"
            />
            <StatCard
              title="결재 대기"
              value="23"
              description="승인 대기 중인 문서"
              icon={CheckCircle}
              trend={{ value: -8, label: '전월 대비', type: 'decrease' }}
              variant="warning"
            />
            <StatCard
              title="활성 사용자"
              value="89"
              description="현재 온라인 사용자"
              icon={Users}
              trend={{ value: 5, label: '전월 대비', type: 'increase' }}
              variant="success"
            />
            <StatCard
              title="시스템 상태"
              value="정상"
              description="모든 서비스 정상 운영"
              icon={AlertTriangle}
              variant="default"
            />
          </div>
        </section>

        {/* 최근 문서 섹션 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">최근 문서</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>문서 목록</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={sampleDocuments}
                columns={documentColumns}
                searchable={true}
                searchPlaceholder="문서 제목, 작성자, 부서로 검색..."
                searchFields={['title', 'author', 'department']}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 20, 50]
                }}
                onRowClick={(record) => {
                  console.log('문서 클릭:', record);
                  // 실제로는 문서 상세 페이지로 이동
                }}
                emptyText="등록된 문서가 없습니다."
              />
            </CardContent>
          </Card>
        </section>

        {/* 기능 소개 섹션 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">구현된 핵심 컴포넌트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>DataTable</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  정렬, 필터링, 페이지네이션, 검색 기능을 갖춘 고급 테이블 컴포넌트
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 컬럼별 정렬</li>
                  <li>• 실시간 검색</li>
                  <li>• 페이지네이션</li>
                  <li>• 행 클릭 이벤트</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>StatCard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  통계 정보를 시각적으로 표시하는 카드 컴포넌트
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 트렌드 표시</li>
                  <li>• 아이콘 지원</li>
                  <li>• 호버 효과</li>
                  <li>• 다양한 변형</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>FormField</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  통일된 스타일의 폼 필드 컴포넌트 세트
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 에러 표시</li>
                  <li>• 유효성 검사</li>
                  <li>• 접근성 지원</li>
                  <li>• 다양한 입력 타입</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>ErrorBoundary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  React 에러를 안전하게 처리하는 에러 바운더리
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 에러 캐치</li>
                  <li>• 사용자 친화적 UI</li>
                  <li>• 복구 옵션</li>
                  <li>• 에러 리포팅</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Toast & Dialog</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  사용자 알림과 확인 다이얼로그 컴포넌트
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 토스트 알림</li>
                  <li>• 확인 다이얼로그</li>
                  <li>• 액션 버튼</li>
                  <li>• 자동 사라짐</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Loading & Layout</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  로딩 상태와 레이아웃 컴포넌트
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 스피너</li>
                  <li>• 스켈레톤</li>
                  <li>• 반응형 레이아웃</li>
                  <li>• 사이드바 네비게이션</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 링크 섹션 */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>테스트 페이지</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                더 자세한 컴포넌트 테스트는 아래 링크에서 확인할 수 있습니다.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="/components-test" 
                  className="text-primary hover:underline font-medium"
                >
                  📋 컴포넌트 테스트 페이지 →
                </a>
                <a 
                  href="/api-test" 
                  className="text-primary hover:underline font-medium"
                >
                  🔗 API 테스트 페이지 →
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
