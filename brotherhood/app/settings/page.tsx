'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Upload,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Lock,
  Key
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// 프로필 설정 타입
interface ProfileSettings {
  firstName: string;
  lastName: string;
  baptismalName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  bio: string;
  avatar?: string;
}

// 보안 설정 타입
interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

// 알림 설정 타입
interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  documentApproval: boolean;
  documentRejection: boolean;
  systemMaintenance: boolean;
  weeklyDigest: boolean;
}

// 시스템 설정 타입
interface SystemSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  emailSignature: string;
}

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');
  
  // 프로필 설정
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    firstName: '',
    lastName: '',
    baptismalName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    bio: '',
    avatar: '',
  });

  // 보안 설정
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    documentApproval: true,
    documentRejection: true,
    systemMaintenance: true,
    weeklyDigest: false,
  });

  // 시스템 설정
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    theme: 'system',
    autoSave: true,
    emailSignature: '',
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      setProfileSettings({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        baptismalName: user.baptismalName || '',
        email: user.email || '',
        phone: '',
        department: '',
        position: '',
        bio: '',
        avatar: '',
      });
    }
  }, [user]);

  // 설정 업데이트
  const updateProfileSettings = (field: keyof ProfileSettings, value: string) => {
    setProfileSettings(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateSecuritySettings = (field: keyof SecuritySettings, value: string | number | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateNotificationSettings = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateSystemSettings = (field: keyof SystemSettings, value: string | boolean) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  // 프로필 저장
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('프로필 저장:', profileSettings);
      alert('프로필이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setErrors({ confirmPassword: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    setIsLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('비밀번호 변경:', securitySettings);
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 설정 저장
  const handleSaveSettings = async (type: string) => {
    setIsLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`${type} 설정 저장`);
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'security', label: '보안', icon: Shield },
    { id: 'notifications', label: '알림', icon: Bell },
    { id: 'system', label: '시스템', icon: SettingsIcon },
  ] as const;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground">
            계정 설정을 관리하고 개인화하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                          activeTab === tab.id ? 'bg-muted border-r-2 border-primary' : ''
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 프로필 설정 */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>프로필 설정</span>
                  </CardTitle>
                  <CardDescription>
                    개인 정보를 수정하고 프로필을 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 프로필 사진 */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileSettings.avatar} alt="프로필 사진" />
                      <AvatarFallback>
                        {profileSettings.firstName?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        사진 변경
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        JPG, PNG 파일만 업로드 가능합니다
                      </p>
                    </div>
                  </div>

                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="이름" required>
                      <Input
                        placeholder="이름을 입력하세요"
                        value={profileSettings.firstName}
                        onChange={(e) => updateProfileSettings('firstName', e.target.value)}
                      />
                    </FormField>

                    <FormField label="성">
                      <Input
                        placeholder="성을 입력하세요"
                        value={profileSettings.lastName}
                        onChange={(e) => updateProfileSettings('lastName', e.target.value)}
                      />
                    </FormField>

                    <FormField label="세례명">
                      <Input
                        placeholder="세례명을 입력하세요"
                        value={profileSettings.baptismalName}
                        onChange={(e) => updateProfileSettings('baptismalName', e.target.value)}
                      />
                    </FormField>

                    <FormField label="이메일" required>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="이메일을 입력하세요"
                          value={profileSettings.email}
                          onChange={(e) => updateProfileSettings('email', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </FormField>

                    <FormField label="전화번호">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="전화번호를 입력하세요"
                          value={profileSettings.phone}
                          onChange={(e) => updateProfileSettings('phone', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </FormField>

                    <FormField label="부서">
                      <Input
                        placeholder="부서를 입력하세요"
                        value={profileSettings.department}
                        onChange={(e) => updateProfileSettings('department', e.target.value)}
                      />
                    </FormField>

                    <FormField label="직책">
                      <Input
                        placeholder="직책을 입력하세요"
                        value={profileSettings.position}
                        onChange={(e) => updateProfileSettings('position', e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField label="소개">
                    <Textarea
                      placeholder="자기소개를 입력하세요..."
                      value={profileSettings.bio}
                      onChange={(e) => updateProfileSettings('bio', e.target.value)}
                      rows={4}
                    />
                  </FormField>

                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        프로필 저장
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 보안 설정 */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>보안 설정</span>
                  </CardTitle>
                  <CardDescription>
                    계정 보안을 강화하고 비밀번호를 변경하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 비밀번호 변경 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center space-x-2">
                      <Lock className="h-5 w-5" />
                      <span>비밀번호 변경</span>
                    </h3>

                    <FormField label="현재 비밀번호" required>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPasswords ? 'text' : 'password'}
                          placeholder="현재 비밀번호를 입력하세요"
                          value={securitySettings.currentPassword}
                          onChange={(e) => updateSecuritySettings('currentPassword', e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormField>

                    <FormField label="새 비밀번호" required>
                      <Input
                        type={showPasswords ? 'text' : 'password'}
                        placeholder="새 비밀번호를 입력하세요"
                        value={securitySettings.newPassword}
                        onChange={(e) => updateSecuritySettings('newPassword', e.target.value)}
                      />
                    </FormField>

                    <FormField label="새 비밀번호 확인" required error={errors.confirmPassword}>
                      <Input
                        type={showPasswords ? 'text' : 'password'}
                        placeholder="새 비밀번호를 다시 입력하세요"
                        value={securitySettings.confirmPassword}
                        onChange={(e) => updateSecuritySettings('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                    </FormField>

                    <Button onClick={handleChangePassword} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          변경 중...
                        </>
                      ) : (
                        '비밀번호 변경'
                      )}
                    </Button>
                  </div>

                  {/* 2단계 인증 */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>2단계 인증</span>
                    </h3>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">SMS 인증</h4>
                        <p className="text-sm text-muted-foreground">
                          로그인 시 SMS로 인증 코드를 받습니다
                        </p>
                      </div>
                      <Button
                        variant={securitySettings.twoFactorEnabled ? "default" : "outline"}
                        onClick={() => updateSecuritySettings('twoFactorEnabled', !securitySettings.twoFactorEnabled)}
                      >
                        {securitySettings.twoFactorEnabled ? '활성화됨' : '비활성화'}
                      </Button>
                    </div>
                  </div>

                  {/* 세션 설정 */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>세션 설정</span>
                    </h3>

                    <FormField label="세션 타임아웃 (분)">
                      <Select
                        value={securitySettings.sessionTimeout.toString()}
                        onValueChange={(value) => updateSecuritySettings('sessionTimeout', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15분</SelectItem>
                          <SelectItem value="30">30분</SelectItem>
                          <SelectItem value="60">1시간</SelectItem>
                          <SelectItem value="120">2시간</SelectItem>
                          <SelectItem value="480">8시간</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 알림 설정 */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>알림 설정</span>
                  </CardTitle>
                  <CardDescription>
                    받고 싶은 알림을 선택하고 설정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 알림 채널 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">알림 채널</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">이메일 알림</h4>
                            <p className="text-sm text-muted-foreground">이메일로 알림을 받습니다</p>
                          </div>
                        </div>
                        <Button
                          variant={notificationSettings.emailNotifications ? "default" : "outline"}
                          onClick={() => updateNotificationSettings('emailNotifications', !notificationSettings.emailNotifications)}
                        >
                          {notificationSettings.emailNotifications ? '활성화' : '비활성화'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">푸시 알림</h4>
                            <p className="text-sm text-muted-foreground">브라우저 푸시 알림을 받습니다</p>
                          </div>
                        </div>
                        <Button
                          variant={notificationSettings.pushNotifications ? "default" : "outline"}
                          onClick={() => updateNotificationSettings('pushNotifications', !notificationSettings.pushNotifications)}
                        >
                          {notificationSettings.pushNotifications ? '활성화' : '비활성화'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">SMS 알림</h4>
                            <p className="text-sm text-muted-foreground">SMS로 알림을 받습니다</p>
                          </div>
                        </div>
                        <Button
                          variant={notificationSettings.smsNotifications ? "default" : "outline"}
                          onClick={() => updateNotificationSettings('smsNotifications', !notificationSettings.smsNotifications)}
                        >
                          {notificationSettings.smsNotifications ? '활성화' : '비활성화'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 알림 유형 */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">알림 유형</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'documentApproval', label: '문서 승인', description: '내 문서가 승인되었을 때' },
                        { key: 'documentRejection', label: '문서 반려', description: '내 문서가 반려되었을 때' },
                        { key: 'systemMaintenance', label: '시스템 점검', description: '시스템 점검 및 업데이트' },
                        { key: 'weeklyDigest', label: '주간 요약', description: '주간 활동 요약 보고서' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{item.label}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Button
                            variant={notificationSettings[item.key as keyof NotificationSettings] ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateNotificationSettings(item.key as keyof NotificationSettings, !notificationSettings[item.key as keyof NotificationSettings])}
                          >
                            {notificationSettings[item.key as keyof NotificationSettings] ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('알림')} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        알림 설정 저장
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 시스템 설정 */}
            {activeTab === 'system' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5" />
                    <span>시스템 설정</span>
                  </CardTitle>
                  <CardDescription>
                    시스템 환경을 설정하고 개인화하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 언어 및 지역 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>언어 및 지역</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="언어">
                        <Select
                          value={systemSettings.language}
                          onValueChange={(value) => updateSystemSettings('language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ko">한국어</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="시간대">
                        <Select
                          value={systemSettings.timezone}
                          onValueChange={(value) => updateSystemSettings('timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Seoul">서울 (UTC+9)</SelectItem>
                            <SelectItem value="Asia/Tokyo">도쿄 (UTC+9)</SelectItem>
                            <SelectItem value="America/New_York">뉴욕 (UTC-5)</SelectItem>
                            <SelectItem value="Europe/London">런던 (UTC+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="날짜 형식">
                        <Select
                          value={systemSettings.dateFormat}
                          onValueChange={(value) => updateSystemSettings('dateFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YYYY-MM-DD">2024-09-18</SelectItem>
                            <SelectItem value="DD/MM/YYYY">18/09/2024</SelectItem>
                            <SelectItem value="MM/DD/YYYY">09/18/2024</SelectItem>
                            <SelectItem value="YYYY년 MM월 DD일">2024년 09월 18일</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="테마">
                        <Select
                          value={systemSettings.theme}
                          onValueChange={(value: 'light' | 'dark' | 'system') => updateSystemSettings('theme', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">라이트</SelectItem>
                            <SelectItem value="dark">다크</SelectItem>
                            <SelectItem value="system">시스템</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  </div>

                  {/* 일반 설정 */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">일반 설정</h3>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">자동 저장</h4>
                        <p className="text-sm text-muted-foreground">문서 작성 시 자동으로 저장합니다</p>
                      </div>
                      <Button
                        variant={systemSettings.autoSave ? "default" : "outline"}
                        onClick={() => updateSystemSettings('autoSave', !systemSettings.autoSave)}
                      >
                        {systemSettings.autoSave ? '활성화' : '비활성화'}
                      </Button>
                    </div>
                  </div>

                  {/* 이메일 서명 */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">이메일 서명</h3>

                    <FormField label="서명">
                      <Textarea
                        placeholder="이메일 서명을 입력하세요..."
                        value={systemSettings.emailSignature}
                        onChange={(e) => updateSystemSettings('emailSignature', e.target.value)}
                        rows={4}
                      />
                    </FormField>
                  </div>

                  <Button onClick={() => handleSaveSettings('시스템')} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        시스템 설정 저장
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
