'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Building2, 
  Shield, 
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-react';
import { statsApi } from '@/services/statsApi';
import type { DocumentStats } from '@/types/stats';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DocumentStatsPage() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await statsApi.getDocumentStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || '통계 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>통계 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>통계 데이터가 없습니다.</p>
      </div>
    );
  }

  // 상태별 데이터 준비
  const statusData = [
    { name: '초안', value: stats.documentsByStatus.draft, color: '#6B7280' },
    { name: '대기', value: stats.documentsByStatus.pending, color: '#F59E0B' },
    { name: '승인', value: stats.documentsByStatus.approved, color: '#10B981' },
    { name: '반려', value: stats.documentsByStatus.rejected, color: '#EF4444' },
  ];

  // 지사별 데이터 준비
  const branchData = stats.documentsByBranch.map((item, index) => ({
    name: item.branchName,
    value: item.count,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length],
  }));

  // 문서 유형별 데이터 준비
  const typeData = stats.documentsByType.map((item, index) => ({
    name: item.documentType,
    documents: item.count,
    avgDays: item.avgProcessingDays,
    fill: COLORS[index % COLORS.length],
  }));

  // 보안 등급별 데이터 준비
  const securityData = stats.documentsBySecurityLevel.map((item, index) => ({
    name: item.securityLevel,
    value: item.count,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length],
  }));

  // 월별 트렌드 데이터 준비
  const monthlyData = stats.monthlyTrend.map(item => ({
    month: item.month,
    생성: item.created,
    승인: item.approved,
    반려: item.rejected,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">문서 통계</h1>
          <p className="text-muted-foreground">문서 처리 현황 및 분석</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 문서</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">총 문서 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인된 문서</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.documentsByStatus.approved.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDocuments > 0 
                ? Math.round((stats.documentsByStatus.approved / stats.totalDocuments) * 100)
                : 0}% 승인율
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.documentsByStatus.pending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">결재 대기</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 처리일</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.processingTimeStats.averageDays}일
            </div>
            <p className="text-xs text-muted-foreground">문서당 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 상세 통계 탭 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="branch">지사별</TabsTrigger>
          <TabsTrigger value="type">문서 유형</TabsTrigger>
          <TabsTrigger value="security">보안 등급</TabsTrigger>
          <TabsTrigger value="trend">트렌드</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 상태별 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>문서 상태별 분포</CardTitle>
                <CardDescription>전체 문서의 상태별 분포</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percentage }) => 
                        `${name}: ${value}개 (${percentage?.toFixed(1)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 처리 시간 통계 */}
            <Card>
              <CardHeader>
                <CardTitle>처리 시간 통계</CardTitle>
                <CardDescription>문서 처리 시간 분석</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.processingTimeStats.averageDays}일
                    </div>
                    <p className="text-sm text-muted-foreground">평균 처리일</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.processingTimeStats.medianDays}일
                    </div>
                    <p className="text-sm text-muted-foreground">중간값</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.processingTimeStats.longestProcessing}일
                    </div>
                    <p className="text-sm text-muted-foreground">최장 처리일</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.processingTimeStats.quickestProcessing}일
                    </div>
                    <p className="text-sm text-muted-foreground">최단 처리일</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 지사별 탭 */}
        <TabsContent value="branch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>지사별 문서 분포</CardTitle>
              <CardDescription>각 지사별 문서 생성 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 문서 유형 탭 */}
        <TabsContent value="type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>문서 유형별 분포</CardTitle>
              <CardDescription>문서 유형별 생성 현황 및 평균 처리일</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="documents" fill="#8884d8" name="문서 수" />
                  <Bar yAxisId="right" dataKey="avgDays" fill="#82ca9d" name="평균 처리일" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보안 등급 탭 */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>보안 등급별 분포</CardTitle>
              <CardDescription>문서 보안 등급별 분포</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={securityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percentage }) => 
                      `${name}: ${value}개 (${percentage?.toFixed(1)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {securityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 트렌드 탭 */}
        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>월별 문서 트렌드</CardTitle>
              <CardDescription>최근 12개월 문서 생성 및 처리 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="생성" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="승인" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="반려" stackId="2" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
