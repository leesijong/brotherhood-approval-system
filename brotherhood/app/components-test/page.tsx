'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { DataTable, Column } from '@/components/DataTable';
import { StatCard, DocumentStatCard, ApprovalStatCard, UserStatCard } from '@/components/StatCard';
import { 
  FormField, 
  FormInput, 
  FormPassword, 
  FormTextarea, 
  FormSelect, 
  FormCheckbox, 
  FormRadioGroup 
} from '@/components/FormField';
import { LoadingSpinner, Skeleton, CardSkeleton, TableSkeleton } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConfirmDialog, DeleteConfirmDialog, SaveConfirmDialog } from '@/components/ConfirmDialog';
import { ToastProviderComponent } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Save,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react';

// 테스트용 데이터
const testTableData = [
  {
    id: 1,
    title: '2024년 1분기 예산 계획서',
    status: 'pending',
    author: '김철수',
    createdAt: '2024-09-19',
    branch: '서울지사'
  },
  {
    id: 2,
    title: '신규 직원 채용 계획',
    status: 'approved',
    author: '이영희',
    createdAt: '2024-09-18',
    branch: '부산지사'
  },
  {
    id: 3,
    title: '시스템 업그레이드 계획',
    status: 'rejected',
    author: '박민수',
    createdAt: '2024-09-17',
    branch: '대구지사'
  },
  {
    id: 4,
    title: '사무실 임대 계약서',
    status: 'draft',
    author: '정수진',
    createdAt: '2024-09-16',
    branch: '인천지사'
  }
];

const tableColumns: Column<typeof testTableData[0]>[] = [
  {
    key: 'title',
    title: '제목',
    dataIndex: 'title',
    sortable: true,
    filterable: true,
  },
  {
    key: 'status',
    title: '상태',
    dataIndex: 'status',
    render: (value) => {
      const statusMap = {
        pending: { label: '대기', variant: 'secondary' as const },
        approved: { label: '승인', variant: 'default' as const },
        rejected: { label: '반려', variant: 'destructive' as const },
        draft: { label: '임시저장', variant: 'outline' as const },
      };
      const status = statusMap[value as keyof typeof statusMap];
      return <Badge variant={status.variant}>{status.label}</Badge>;
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
    key: 'createdAt',
    title: '작성일',
    dataIndex: 'createdAt',
    sortable: true,
  },
  {
    key: 'branch',
    title: '지사',
    dataIndex: 'branch',
    sortable: true,
  },
];

// 에러를 발생시키는 테스트 컴포넌트
function ErrorTestComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('테스트 에러입니다!');
  }

  return (
    <Button onClick={() => setShouldError(true)} variant="destructive">
      에러 발생시키기
    </Button>
  );
}

// 컴포넌트 테스트 섹션
function ComponentTestSection() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: false,
    priority: 'medium'
  });

  // 토스트 테스트 함수들

  const handleTestToast = () => {
    console.log('토스트 테스트');
  };

  const handleTestApiToast = () => {
    console.log('API 토스트 테스트');
  };

  const handleTestFormToast = () => {
    console.log('폼 토스트 테스트');
  };

  const handleTestLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* 통계 카드 테스트 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">통계 카드 컴포넌트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DocumentStatCard 
            count={156} 
            trend={{ value: 12, label: '전월 대비', type: 'increase' }}
          />
          <ApprovalStatCard 
            pending={8} 
            completed={142} 
            trend={{ value: -5, label: '전월 대비', type: 'decrease' }}
          />
          <UserStatCard 
            total={89} 
            active={82} 
            trend={{ value: 3, label: '전월 대비', type: 'increase' }}
          />
          <StatCard
            title="예산 사용률"
            value="₩45,230,000"
            description="월 예산 대비"
            icon={FileText}
            trend={{ value: 8, label: '전월 대비', type: 'increase' }}
            variant="warning"
          />
        </div>
      </section>

      {/* 테이블 컴포넌트 테스트 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">데이터 테이블 컴포넌트</h2>
        <DataTable
          data={testTableData}
          columns={tableColumns}
          searchable={true}
          searchPlaceholder="문서 검색..."
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20]
          }}
          onRowClick={(record) => console.log('Row clicked:', record)}
        />
      </section>

      {/* 폼 컴포넌트 테스트 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">폼 컴포넌트</h2>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>폼 필드 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormInput
              label="제목"
              placeholder="문서 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <FormPassword
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              required
            />
            
            <FormTextarea
              label="설명"
              placeholder="문서 설명을 입력하세요"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            
            <FormSelect
              label="카테고리"
              placeholder="카테고리를 선택하세요"
              options={[
                { value: 'general', label: '일반' },
                { value: 'urgent', label: '긴급' },
                { value: 'confidential', label: '기밀' }
              ]}
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            />
            
            <FormCheckbox
              label="공개 문서"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked as boolean })}
            />
            
            <FormRadioGroup
              label="우선순위"
              options={[
                { value: 'low', label: '낮음' },
                { value: 'medium', label: '보통' },
                { value: 'high', label: '높음' }
              ]}
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            />
            
            <div className="flex space-x-2">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
              <Button variant="outline" type="button">
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 로딩 컴포넌트 테스트 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">로딩 컴포넌트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>로딩 스피너</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <LoadingSpinner size="sm" text="로딩 중..." />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" variant="primary" />
              </div>
              <Button onClick={handleTestLoading} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    처리 중...
                  </>
                ) : (
                  '로딩 테스트'
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>스켈레톤 로딩</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <CardSkeleton />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 토스트 컴포넌트 테스트 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">토스트 알림</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleTestToast} variant="default">
            기본 토스트
          </Button>
          <Button onClick={handleTestApiToast} variant="secondary">
            API 토스트
          </Button>
          <Button onClick={handleTestFormToast} variant="outline">
            폼 토스트
          </Button>
        </div>
      </section>

      {/* 확인 다이얼로그 테스트 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">확인 다이얼로그</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowConfirm(true)} variant="default">
            기본 확인
          </Button>
          <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive">
            삭제 확인
          </Button>
          <Button onClick={() => setShowSaveConfirm(true)} variant="secondary">
            저장 확인
          </Button>
        </div>

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="테스트 확인"
          description="이 작업을 계속하시겠습니까?"
          onConfirm={() => {
            setShowConfirm(false);
            console.log('확인됨');
          }}
        />

        <DeleteConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          itemName="테스트 문서"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            console.log('삭제됨');
          }}
        />

        <SaveConfirmDialog
          open={showSaveConfirm}
          onOpenChange={setShowSaveConfirm}
          onConfirm={() => {
            setShowSaveConfirm(false);
            console.log('저장됨');
          }}
        />
      </section>

      {/* 에러 바운더리 테스트 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">에러 바운더리</h2>
        <ErrorBoundary
          showDetails={true}
          onError={(error, errorInfo) => {
            console.error('Caught error:', error, errorInfo);
          }}
        >
          <ErrorTestComponent />
        </ErrorBoundary>
      </section>
    </div>
  );
}

// 메인 컴포넌트
export default function ComponentsTestPage() {
  const { isAuthenticated } = useAuthStore();

  // initTestUser 제거 - 자동 로그인 비활성화

  return (
    <ToastProviderComponent>
      <AppLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">핵심 공통 컴포넌트 테스트</h1>
            <p className="text-muted-foreground">
              구현된 핵심 공통 컴포넌트들의 기능을 테스트할 수 있습니다.
            </p>
          </div>
          
          <ComponentTestSection />
        </div>
      </AppLayout>
    </ToastProviderComponent>
  );
}
