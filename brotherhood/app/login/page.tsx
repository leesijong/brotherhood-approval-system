'use client';

import React, { useState, useEffect } from 'react';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  AlertCircle, 
  CheckCircle,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/authApi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 로그인 폼 데이터 타입
interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
  mfaCode?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false,
    mfaCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showMfa, setShowMfa] = useState(false);
  const [loginStep, setLoginStep] = useState<'credentials' | 'mfa' | 'success'>('credentials');

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof LoginFormData, value: any) => {
    // 로그인 ID 필드의 경우 영문, 숫자, 언더스코어만 허용
    if (field === 'username' && typeof value === 'string') {
      value = value.replace(/[^a-zA-Z0-9_]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = '로그인 ID를 입력해주세요';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '로그인 ID는 영문, 숫자, 언더스코어(_)만 사용 가능합니다';
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    if (showMfa && !formData.mfaCode?.trim()) {
      newErrors.mfaCode = 'MFA 코드를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 직접 fetch를 사용한 로그인 요청 (임시)
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 로그인 성공
        const userData = data.data;
        
        login(
          {
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken
          },
          {
            id: userData.userInfo.id,
            username: userData.userInfo.username,
            email: userData.userInfo.email,
            firstName: userData.userInfo.firstName,
            lastName: userData.userInfo.lastName,
            baptismalName: userData.userInfo.baptismalName,
            displayName: userData.userInfo.displayName,
            branchId: userData.userInfo.branchId,
            branchName: userData.userInfo.branchName,
            branch: userData.userInfo.branch,
            roles: userData.userInfo.roles,
            isActive: userData.userInfo.isActive
          }
        );

        setLoginStep('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // 로그인 실패
        setErrors({ username: data.message || '로그인에 실패했습니다' });
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      
      // API 에러 메시지 처리
      let errorMessage = '서버와의 통신 중 오류가 발생했습니다';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setErrors({ username: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // MFA 재전송
  const handleResendMfa = () => {
    console.log('MFA 코드 재전송');
    // 실제로는 MFA 코드 재전송 API 호출
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 로고 및 제목 */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center">
            <Image 
              src="/images/brotherhood-logo.png" 
              alt="한국순교복자성직수도회" 
              width={64}
              height={64}
              className="w-16 h-16"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Brotherhood</h1>
          <p className="text-muted-foreground">
            한국순교복자성직수도회 결재 시스템
          </p>
        </div>

        {/* 로그인 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {loginStep === 'credentials' && '로그인'}
              {loginStep === 'mfa' && '2단계 인증'}
              {loginStep === 'success' && '로그인 성공'}
            </CardTitle>
            <CardDescription>
              {loginStep === 'credentials' && '계정 정보를 입력하세요'}
              {loginStep === 'mfa' && '휴대폰으로 전송된 인증 코드를 입력하세요'}
              {loginStep === 'success' && '로그인이 완료되었습니다'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginStep === 'success' ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium">로그인 성공!</p>
                <p className="text-sm text-muted-foreground">
                  대시보드로 이동합니다...
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* 로그인 ID */}
                <FormField
                  label="로그인 ID"
                  required
                  error={errors.username}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="로그인 ID를 입력하세요"
                      value={formData.username}
                      onChange={(e) => updateFormData('username', e.target.value)}
                      className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                </FormField>

                {/* 비밀번호 */}
                <FormField
                  label="비밀번호"
                  required
                  error={errors.password}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormField>

                {/* MFA 코드 */}
                {showMfa && (
                  <FormField
                    label="인증 코드"
                    required
                    error={errors.mfaCode}
                    description="휴대폰으로 전송된 6자리 코드를 입력하세요"
                  >
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="123456"
                        value={formData.mfaCode}
                        onChange={(e) => updateFormData('mfaCode', e.target.value)}
                        className={`pl-10 ${errors.mfaCode ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                        maxLength={6}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        코드를 받지 못하셨나요?
                      </p>
                      <button
                        type="button"
                        onClick={handleResendMfa}
                        className="text-xs text-primary hover:underline"
                        disabled={isLoading}
                      >
                        재전송
                      </button>
                    </div>
                  </FormField>
                )}

                {/* 로그인 유지 */}
                {!showMfa && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => updateFormData('rememberMe', checked)}
                      disabled={isLoading}
                    />
                    <label htmlFor="remember" className="text-sm font-medium">
                      로그인 상태 유지
                    </label>
                  </div>
                )}

                {/* 로그인 버튼 */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {showMfa ? '인증 중...' : '로그인 중...'}
                    </>
                  ) : (
                    showMfa ? '인증 확인' : '로그인'
                  )}
                </Button>

                {/* 테스트 계정 정보 */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">테스트 계정</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><strong>관리자:</strong> admin / admin123</p>
                    <p><strong>일반사용자:</strong> test_id01 / admin123</p>
                    <p className="text-xs text-blue-600">* 로그인 ID는 영문, 숫자, 언더스코어만 사용 가능합니다</p>
                  </div>
                </div>

                {/* 비밀번호 찾기 */}
                {!showMfa && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      disabled={isLoading}
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* 추가 정보 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            계정이 없으신가요?{' '}
            <button className="text-primary hover:underline">
              관리자에게 문의
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
