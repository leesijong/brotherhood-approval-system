'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  Camera,
  Building
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    baptismalName: '',
    phone: '',
    address: '',
    branchName: '',
  });

  // 사용자 정보로 폼 데이터 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        email: user.email || '',
        baptismalName: user.baptismalName || '',
        phone: user.phone || '',
        address: user.address || '',
        branchName: user.branchName || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 폼 데이터를 원래 사용자 정보로 리셋
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        email: user.email || '',
        baptismalName: user.baptismalName || '',
        phone: user.phone || '',
        address: user.address || '',
        branchName: user.branchName || '',
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 실제로는 API 호출을 통해 프로필 업데이트
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 지연

      // 로컬 상태 업데이트
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        email: formData.email,
        baptismalName: formData.baptismalName,
        phone: formData.phone,
        address: formData.address,
        branchName: formData.branchName,
        displayName: formData.firstName,
      };

      updateUser(updatedUser);

      toast({
        title: '프로필 업데이트 완료',
        description: '프로필 정보가 성공적으로 업데이트되었습니다.',
        variant: 'default',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      toast({
        title: '프로필 업데이트 실패',
        description: '프로필 정보 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">사용자 정보를 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">프로필</h1>
            <p className="text-muted-foreground">
              개인 정보를 확인하고 수정할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                편집
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? '저장 중...' : '저장'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 프로필 카드 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" alt={user.displayName} />
                      <AvatarFallback className="text-2xl">
                        {user.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        variant="secondary"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.displayName}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    {user.baptismalName && (
                      <Badge variant="outline" className="mt-2">
                        세례명: {user.baptismalName}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.branchName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div className="flex space-x-1">
                      {user.roles?.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      가입일: {new Date().toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 프로필 정보 폼 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>개인 정보</CardTitle>
                <CardDescription>
                  개인 정보를 확인하고 수정할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">이름</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baptismalName">세례명</Label>
                  <Input
                    id="baptismalName"
                    value={formData.baptismalName}
                    onChange={(e) => handleInputChange('baptismalName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="세례명을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="주소를 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchName">소속 지사</Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => handleInputChange('branchName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 계정 설정 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>계정 설정</CardTitle>
                <CardDescription>
                  계정 관련 설정을 관리할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">비밀번호 변경</h4>
                    <p className="text-sm text-muted-foreground">
                      계정 보안을 위해 정기적으로 비밀번호를 변경하세요.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    변경
                  </Button>
                </div>

                {/* 관리자 권한이 있는 사용자만 계정 삭제 옵션 표시 */}
                {user.roles?.includes('ADMIN') && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">계정 삭제</h4>
                        <p className="text-sm text-muted-foreground">
                          계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        삭제
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
