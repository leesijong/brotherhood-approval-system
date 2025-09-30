'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  displayName: string;
  baptismalName: string;
  branchId?: string;
  branchName?: string;
  branchCode?: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export default function UserManagementTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<UserDto> | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
    setError(null);
    setUsers([]);
    setPageInfo(null);
  };

  const testUserList = async () => {
    setLoading(true);
    setError(null);
    addTestResult('사용자 목록 조회 테스트 시작...');

    try {
      const response = await fetch('http://localhost:8080/api/users?page=0&size=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      addTestResult(`HTTP 상태 코드: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addTestResult(`오류 응답: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse<PageResponse<UserDto>> = await response.json();
      addTestResult(`응답 성공: ${result.success}`);
      addTestResult(`메시지: ${result.message}`);
      
      if (result.data) {
        setUsers(result.data.content || []);
        setPageInfo(result.data);
        addTestResult(`사용자 수: ${result.data.content?.length || 0}`);
        addTestResult(`전체 사용자 수: ${result.data.totalElements || 0}`);
        addTestResult(`페이지: ${result.data.page + 1}/${result.data.totalPages}`);
      }

      addTestResult('사용자 목록 조회 성공!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMessage);
      addTestResult(`오류 발생: ${errorMessage}`);
      console.error('사용자 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const testActiveUsers = async () => {
    setLoading(true);
    setError(null);
    addTestResult('활성 사용자 조회 테스트 시작...');

    try {
      const response = await fetch('http://localhost:8080/api/users/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      addTestResult(`HTTP 상태 코드: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addTestResult(`오류 응답: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse<UserDto[]> = await response.json();
      addTestResult(`응답 성공: ${result.success}`);
      addTestResult(`활성 사용자 수: ${result.data?.length || 0}`);

      addTestResult('활성 사용자 조회 성공!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMessage);
      addTestResult(`오류 발생: ${errorMessage}`);
      console.error('활성 사용자 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const testUserStats = async () => {
    setLoading(true);
    setError(null);
    addTestResult('사용자 통계 조회 테스트 시작...');

    try {
      // 관리자 로그인
      addTestResult('관리자 로그인 시도...');
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
      });

      addTestResult(`로그인 HTTP 상태 코드: ${loginResponse.status}`);

      if (!loginResponse.ok) {
        const loginErrorText = await loginResponse.text();
        addTestResult(`로그인 오류 응답: ${loginErrorText}`);
        throw new Error(`로그인 실패 HTTP ${loginResponse.status}: ${loginErrorText}`);
      }

      const loginResult: ApiResponse<any> = await loginResponse.json();
      addTestResult(`로그인 성공: ${loginResult.success}`);
      addTestResult(`사용자명: ${loginResult.data?.userInfo?.username || 'N/A'}`);
      addTestResult(`사용자 역할: ${loginResult.data?.userInfo?.roles?.join(', ') || 'N/A'}`);
      
      const token = loginResult.data.accessToken;
      addTestResult(`토큰 받음: ${token ? '성공' : '실패'}`);

      // 사용자 통계 조회
      addTestResult('사용자 통계 조회 시도...');
      const response = await fetch('http://localhost:8080/api/users/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      addTestResult(`통계 조회 HTTP 상태 코드: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addTestResult(`통계 조회 오류 응답: ${errorText}`);
        throw new Error(`통계 조회 실패 HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse<any> = await response.json();
      addTestResult(`응답 성공: ${result.success}`);
      addTestResult(`전체 사용자 수: ${result.data?.totalUsers || 0}`);
      addTestResult(`활성 사용자 수: ${result.data?.activeUsers || 0}`);
      addTestResult(`비활성 사용자 수: ${result.data?.inactiveUsers || 0}`);
      addTestResult(`지사별 사용자 수: ${JSON.stringify(result.data?.usersByBranch || {})}`);

      addTestResult('사용자 통계 조회 성공! (관리자 권한)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMessage);
      addTestResult(`오류 발생: ${errorMessage}`);
      console.error('사용자 통계 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">사용자 관리 기능 테스트</h1>
          <p className="text-muted-foreground mt-2">
            사용자 목록 조회 API 테스트 및 오류 확인
          </p>
        </div>
        <Button onClick={clearResults} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          결과 초기화
        </Button>
      </div>

      {/* 테스트 버튼들 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            API 테스트
          </CardTitle>
          <CardDescription>
            사용자 관리 관련 API를 테스트합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testUserList} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              사용자 목록 조회 (GET /api/users)
            </Button>
            
            <Button 
              onClick={testActiveUsers} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              활성 사용자 조회 (GET /api/users/active)
            </Button>
            
            <Button 
              onClick={testUserStats} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              사용자 통계 조회 (GET /api/users/stats)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 오류 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>오류 발생:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 테스트 결과 로그 */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 결과 로그</CardTitle>
          <CardDescription>
            API 호출 결과 및 상세 로그
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">테스트를 실행해주세요.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 표시 */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>
              조회된 사용자 목록 ({pageInfo?.totalElements || 0}명 중 {users.length}명 표시)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자명</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>세례명</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>지사</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName || user.displayName}</TableCell>
                      <TableCell>{user.baptismalName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.branchName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 페이지 정보 */}
      {pageInfo && (
        <Card>
          <CardHeader>
            <CardTitle>페이지 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">현재 페이지</p>
                <p className="text-lg font-semibold">{pageInfo.page + 1}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">페이지 크기</p>
                <p className="text-lg font-semibold">{pageInfo.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 요소</p>
                <p className="text-lg font-semibold">{pageInfo.totalElements}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 페이지</p>
                <p className="text-lg font-semibold">{pageInfo.totalPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
