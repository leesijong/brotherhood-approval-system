'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, CheckCircle, XCircle, Shield } from 'lucide-react';

export default function FreshLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 페이지 로드 시 모든 저장소 초기화
  useEffect(() => {
    console.log('Fresh Login Page - 초기화 중...');
    
    // 모든 로컬/세션 스토리지 초기화
    localStorage.clear();
    sessionStorage.clear();
    
    // 쿠키도 초기화 (가능한 범위 내에서)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('Fresh Login Page - 초기화 완료');
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('로그인 시도:', username);
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('로그인 응답:', data);
      
      if (response.ok && data.success) {
        setResult(data);
        setError(null);
        console.log('로그인 성공!');
      } else {
        setError(data.message || '로그인에 실패했습니다.');
        setResult(null);
        console.error('로그인 실패:', data.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`네트워크 오류: ${errorMessage}`);
      setResult(null);
      console.error('로그인 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
            <Shield className="w-6 h-6 mr-2" />
            Fresh Login Test
          </CardTitle>
          <CardDescription>
            완전히 초기화된 상태에서 로그인 테스트
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>
          
          <Button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && result.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">로그인 성공!</p>
                  <div className="text-sm space-y-1">
                    <p><strong>사용자:</strong> {result.data?.userInfo.baptismalName} ({result.data?.userInfo.username})</p>
                    <p><strong>이메일:</strong> {result.data?.userInfo.email}</p>
                    <p><strong>토큰:</strong> {result.data?.accessToken ? '✅ 발급됨' : '❌ 없음'}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">테스트 계정</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>관리자:</strong> admin / admin123</p>
              <p><strong>일반사용자:</strong> user / user123</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-800 mb-1">초기화 상태</h4>
            <p className="text-xs text-blue-600">
              이 페이지는 로드 시 모든 저장소를 초기화합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
