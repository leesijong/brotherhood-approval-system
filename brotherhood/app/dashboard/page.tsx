'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Edit,
  Download,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi } from '@/services/dashboardApi';
import { documentApi } from '@/services/documentApi';
import Link from 'next/link';

// 통계 데이터 타입
interface DashboardStats {
  totalDocuments: number;
  pendingApprovals: number;
  approvedToday: number;
  activeUsers: number;
  documentTrend: number;
  approvalTrend: number;
}

// 최근 문서 타입
interface RecentDocument {
  id: string;
  title: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  author: string;
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// 결재 대기 목록 타입
interface PendingApproval {
  id: string;
  title: string;
  author: string;
  submittedAt: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  step: number;
  totalSteps: number;
}

// 활동 타입
interface Activity {
  id: string;
  type: 'document_created' | 'document_approved' | 'document_rejected' | 'user_login';
  description: string;
  user: string;
  timestamp: string;
  documentId?: string;
}

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 대시보드 데이터 로드
  useEffect(() => {
    const loadDashboardData = async () => {
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
            totalDocuments: statsData.totalDocuments || 0,
            pendingApprovals: statsData.pendingApprovals || 0,
            approvedToday: statsData.approvedDocuments || 0, // 오늘 승인된 문서 수
            activeUsers: statsData.activeUsers || 0,
            documentTrend: 0, // 나중에 구현
            approvalTrend: 0, // 나중에 구현
          });
        }

        // 최근 문서 조회 (사용자별)
        const documentsResponse = await documentApi.getDocuments({
          authorId: user.id,
          page: 0,
          size: 100
        });

        if (documentsResponse.success && documentsResponse.data) {
          const documents = documentsResponse.data.content || [];
          
          // 최근 문서 (최대 5개)
          const recentDocs = documents
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(doc => ({
              id: doc.id,
              title: doc.title,
              status: doc.status as 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED',
              author: doc.authorDisplayName || doc.authorName || '알 수 없음',
              createdAt: doc.createdAt,
              priority: (doc.priority || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH'
            }));
          setRecentDocuments(recentDocs);
        }

        // 결재 대기 목록 조회 (백엔드 API 호출)
        try {
          const pendingApprovalsResponse = await dashboardApi.getPendingApprovals();
          if (pendingApprovalsResponse.success && pendingApprovalsResponse.data) {
            const pendingApprovals = pendingApprovalsResponse.data.map(doc => ({
              id: doc.documentId || doc.id,
              title: doc.documentTitle,
              author: doc.authorName || '알 수 없음',
              submittedAt: doc.submittedAt || new Date().toISOString(),
              dueDate: doc.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              priority: (doc.priority || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
              step: 1, // 임시값
              totalSteps: 1 // 임시값
            }));
            setPendingApprovals(pendingApprovals);
          } else {
            console.log('결재 대기 목록이 비어있습니다:', pendingApprovalsResponse.message);
            setPendingApprovals([]);
          }
        } catch (error) {
          console.error('결재 대기 목록 조회 실패:', error);
          setPendingApprovals([]);
        }

        // 최근 활동 (임시로 빈 배열)
        setActivities([]);

      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        // 오류 시 기본값 설정
        setStats({
          totalDocuments: 0,
          pendingApprovals: 0,
          approvedToday: 0,
          activeUsers: 0,
          documentTrend: 0,
          approvalTrend: 0,
        });
        setRecentDocuments([]);
        setPendingApprovals([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // 상태별 색상 매핑
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: '초안',
    PENDING: '검토중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">대시보드를 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">DashBoard</h1>
            <p className="text-muted-foreground">
              안녕하세요, {user?.displayName || '사용자'}님! 오늘도 좋은 하루 되세요.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              상세 분석
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="전체 문서"
            value={stats?.totalDocuments || 0}
            icon={FileText}
            trend={{
              value: stats?.documentTrend || 0,
              label: "지난 주 대비",
              type: (stats?.documentTrend || 0) > 0 ? "increase" : "decrease"
            }}
          />
          <StatCard
            title="결재 대기"
            value={stats?.pendingApprovals || 0}
            icon={Clock}
            trend={{
              value: Math.abs(stats?.approvalTrend || 0),
              label: "지난 주 대비",
              type: (stats?.approvalTrend || 0) > 0 ? "increase" : "decrease"
            }}
          />
          <StatCard
            title="오늘 승인"
            value={stats?.approvedToday || 0}
            icon={CheckCircle}
            trend={{
              value: 12,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="활성 사용자"
            value={stats?.activeUsers || 0}
            icon={Users}
            trend={{
              value: 5,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 결재 대기 목록 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>결재 대기 목록</span>
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/approvals">
                    <Eye className="mr-2 h-4 w-4" />
                    전체 보기
                  </Link>
                </Button>
              </div>
              <CardDescription>
                승인이 필요한 문서들을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{approval.title}</h4>
                        <Badge variant="outline" className={priorityColors[approval.priority]}>
                          {priorityLabels[approval.priority]}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{approval.author}</span>
                        <span>•</span>
                        <span>{new Date(approval.submittedAt).toLocaleDateString('ko-KR')}</span>
                        <span>•</span>
                        <span>단계 {approval.step}/{approval.totalSteps}</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(approval.step / approval.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/documents/${approval.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 최근 문서 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>최근 문서</span>
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/documents">
                    <Eye className="mr-2 h-4 w-4" />
                    전체 보기
                  </Link>
                </Button>
              </div>
              <CardDescription>
                최근에 생성되거나 수정된 문서들입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link 
                          href={`/documents/${doc.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {doc.title}
                        </Link>
                        <Badge className={statusColors[doc.status]}>
                          {statusLabels[doc.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{doc.author}</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/documents/${doc.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>최근 활동</span>
            </CardTitle>
            <CardDescription>
              시스템에서 발생한 최근 활동들을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'document_approved' ? 'bg-green-100 text-green-600' :
                    activity.type === 'document_created' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'document_rejected' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'document_approved' ? <CheckCircle className="h-4 w-4" /> :
                     activity.type === 'document_created' ? <FileText className="h-4 w-4" /> :
                     activity.type === 'document_rejected' ? <AlertTriangle className="h-4 w-4" /> :
                     <Users className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  {activity.documentId && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/documents/${activity.documentId}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>
              자주 사용하는 기능들에 빠르게 접근하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/documents/create">
                  <Plus className="h-6 w-6 mb-2" />
                  새 문서 작성
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/approvals">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  결재 관리
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/documents">
                  <FileText className="h-6 w-6 mb-2" />
                  문서 목록
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/users">
                  <Users className="h-6 w-6 mb-2" />
                  사용자 관리
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
