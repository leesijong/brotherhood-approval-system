'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/DataTable';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ToastContainer from '@/components/ui/toast-container';
import { useToast } from '@/hooks/useToast';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Shield, 
  Mail,
  MapPin,
  Search,
  Edit,
  MoreHorizontal,
  Crown,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/services/userApi';

// 사용자 타입
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  baptismalName?: string;
  displayName: string;
  avatar?: string;
  branchId: string;
  branchName: string;
  department?: string;
  position?: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 통계 타입
interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  adminUsers: number;
  regularUsers: number;
}

export default function UsersPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { toasts, removeToast, showSuccess, showError, showInfo, showWarning } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 관리자 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // 사용자 추가 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    baptismalName: '',
    password: '',
    phone: '',
    department: '',
    position: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    baptismalName: '',
    phone: '',
    department: '',
    position: '',
    role: 'USER',
    isActive: true,
  });

  // 권한 레벨 옵션 (requirement.md 기준)
  const roleOptions = [
    { value: 'USER', label: '일반수도자', description: '문서 기안, 본인 기안 문서 상태 조회' },
    { value: 'MANAGER', label: '중간관리수도자', description: '부서/공동체 단위 결재 권한' },
    { value: 'ADMIN', label: '책임수도자', description: '기관/사도직 단위 최종 승인 권한' },
    { value: 'SUPER_ADMIN', label: '장상', description: '최고 권한자, 전결 범위 설정' },
    { value: 'SYSTEM_ADMIN', label: '관리자', description: '운영 및 계정/조직 관리' },
  ];


  // 사용자 데이터 로드
  useEffect(() => {
    const loadUsersData = async () => {
      try {
        console.log('=== 사용자 관리 페이지: 실제 API 호출 시작 ===');
        
        // 1. 사용자 통계 조회
        console.log('2. 사용자 통계 조회 API 호출...');
        const statsResponse = await fetch('http://localhost:8080/api/users/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키 포함
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('✅ 사용자 통계 조회 성공:', statsData);
          setStats({
            totalUsers: statsData.data.totalUsers,
            activeUsers: statsData.data.activeUsers,
            inactiveUsers: statsData.data.totalUsers - statsData.data.activeUsers,
            newUsersThisMonth: 0, // API에 없음
            adminUsers: 0, // API에 없음
            regularUsers: statsData.data.activeUsers, // 임시값
          });
        } else {
          console.error('❌ 사용자 통계 조회 실패:', statsResponse.status);
        }

        // 3. 사용자 목록 조회
        console.log('3. 사용자 목록 조회 API 호출...');
        const usersResponse = await userApi.getUsers({ page: 0, size: 20 });
        
        if (usersResponse.success) {
          console.log('✅ 사용자 목록 조회 성공:', usersResponse.data);
          
          // 백엔드 응답을 프론트엔드 형식으로 변환
          const mappedUsers: User[] = usersResponse.data.content.map((user: any) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            baptismalName: user.baptismalName,
            displayName: user.displayName || `${user.firstName} ${user.lastName}`,
            branchId: user.branchId,
            branchName: user.branchName || '미지정',
            department: user.department,
            position: user.position,
            phone: user.phone,
            isActive: user.isActive,
            roles: user.roles || ['USER'],
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }));
          
          setUsers(mappedUsers);
        } else {
          console.error('❌ 사용자 목록 조회 실패:', usersResponse.message);
          setUsers([]);
        }
        
      } catch (error) {
        console.error('❌ 사용자 데이터 로드 실패:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsersData();
  }, []);

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'ACTIVE' && user.isActive) ||
                         (statusFilter === 'INACTIVE' && !user.isActive);
    const matchesRole = roleFilter === 'ALL' || user.roles.includes(roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // 역할별 색상 매핑
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    MANAGER: 'bg-purple-100 text-purple-800',
    SUPERVISOR: 'bg-blue-100 text-blue-800',
    USER: 'bg-gray-100 text-gray-800',
  };

  const roleLabels: Record<string, string> = {
    ADMIN: '관리자',
    MANAGER: '관리자',
    SUPERVISOR: '중간관리자',
    USER: '일반사용자',
  };


  // 사용자 생성 모달 열기
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  // 사용자 생성 모달 닫기
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      name: '',
      email: '',
      baptismalName: '',
      password: '',
      phone: '',
      department: '',
      position: '',
    });
  };

  // 사용자 수정 모달 열기
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.displayName || user.username,
      email: user.email,
      baptismalName: user.baptismalName || '',
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      role: user.roles?.[0] || 'USER',
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  // 사용자 수정 모달 닫기
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditForm({
      name: '',
      email: '',
      baptismalName: '',
      phone: '',
      department: '',
      position: '',
      role: 'USER',
      isActive: true,
    });
  };

  // 폼 입력 처리
  const handleFormChange = (field: string, value: string) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 수정 폼 입력 처리
  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 실제 사용자 생성
  const handleCreateUser = async () => {
    try {
      console.log('=== 사용자 생성 시작 ===');
      
      // 필수 필드 검증
      if (!createForm.name || !createForm.email || !createForm.baptismalName || !createForm.password) {
        showWarning('입력 오류', '필수 필드를 모두 입력해주세요.');
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createForm.email)) {
        showWarning('입력 오류', '올바른 이메일 형식을 입력해주세요.');
        return;
      }

      // 비밀번호 길이 검증
      if (createForm.password.length < 8) {
        showWarning('입력 오류', '비밀번호는 8자 이상이어야 합니다.');
        return;
      }
      
      // 1. 관리자 로그인 확인
      if (!isLoggedIn) {
        console.log('1. 관리자 로그인 시도...');
      } else {
        console.log('1. 이미 로그인된 상태');
      }
      
      // 2. 사용자 생성
      const newUser = {
        name: createForm.name,
        email: createForm.email,
        baptismalName: createForm.baptismalName,
        password: createForm.password,
        phone: createForm.phone || null,
        department: createForm.department || null,
        position: createForm.position || null,
      };

      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ 사용자 생성 성공:', userData);
        showSuccess(
          '사용자 생성 성공',
          `이름: ${userData.data.name}\n이메일: ${userData.data.email}\n세례명: ${userData.data.baptismalName}`
        );
        
        // 모달 닫기 및 목록 새로고침
        handleCloseCreateModal();
        window.location.reload();
      } else {
        console.error('❌ 사용자 생성 실패:', response.status);
        const errorData = await response.json();
        showError('사용자 생성 실패', errorData.message || '알 수 없는 오류');
      }
    } catch (error) {
      console.error('❌ 사용자 생성 오류:', error);
      showError('사용자 생성 오류', `오류 발생: ${error}`);
    }
  };

  // 실제 사용자 수정
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      console.log('=== 사용자 정보 수정 시작 ===');

      // 필수 필드 검증
      if (!editForm.name || !editForm.email || !editForm.baptismalName) {
        showWarning('입력 오류', '필수 필드를 모두 입력해주세요.');
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        showWarning('입력 오류', '올바른 이메일 형식을 입력해주세요.');
        return;
      }

      // 1. 관리자 로그인 확인
      if (!isLoggedIn) {
        console.log('1. 관리자 로그인 시도...');
      } else {
        console.log('1. 이미 로그인된 상태');
      }

      // 2. 사용자 정보 수정
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        baptismalName: editForm.baptismalName,
        phone: editForm.phone || null,
        department: editForm.department || null,
        position: editForm.position || null,
        role: editForm.role,
        isActive: editForm.isActive,
      };

      const response = await fetch(`http://localhost:8080/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ 사용자 정보 수정 성공:', userData);
        showSuccess(
          '사용자 정보 수정 성공',
          `이름: ${userData.data.name}\n이메일: ${userData.data.email}\n권한: ${roleOptions.find(r => r.value === editForm.role)?.label}`
        );
        
        // 모달 닫기 및 목록 새로고침
        handleCloseEditModal();
        window.location.reload();
      } else {
        console.error('❌ 사용자 정보 수정 실패:', response.status);
        const errorData = await response.json();
        showError('사용자 정보 수정 실패', errorData.message || '알 수 없는 오류');
      }
    } catch (error) {
      console.error('❌ 사용자 정보 수정 오류:', error);
      showError('사용자 정보 수정 오류', `오류 발생: ${error}`);
    }
  };


  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'user',
      title: '사용자',
      dataIndex: 'displayName',
      render: (value: any, record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={record.avatar} alt={record.displayName} />
            <AvatarFallback>
              {record.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium">{record.displayName}</p>
              {record.roles.includes('ADMIN') && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
              {!record.isActive && (
                <Badge variant="secondary" className="text-xs">
                  비활성
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {record.email}
            </div>
            {record.baptismalName && (
              <div className="text-xs text-primary">
                세례명: {record.baptismalName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      title: '부서/직책',
      dataIndex: 'department',
      render: (value: any, record: User) => (
        <div>
          <p className="font-medium">{record.department || '-'}</p>
          <p className="text-sm text-muted-foreground">{record.position || '-'}</p>
        </div>
      ),
    },
    {
      key: 'branch',
      title: '지사',
      dataIndex: 'branchName',
      render: (value: any, record: User) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{record.branchName}</span>
        </div>
      ),
    },
    {
      key: 'roles',
      title: '역할',
      dataIndex: 'roles',
      render: (value: any, record: User) => (
        <div className="flex flex-wrap gap-1">
          {record.roles.map((role) => (
            <Badge key={role} className={roleColors[role]} variant="secondary">
              {roleLabels[role]}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'lastLogin',
      title: '최근 로그인',
      dataIndex: 'lastLoginAt',
      render: (value: any, record: User) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {record.lastLoginAt 
              ? new Date(record.lastLoginAt).toLocaleDateString('ko-KR')
              : '로그인 없음'
            }
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: '상태',
      dataIndex: 'isActive',
      render: (value: any, record: User) => (
        <Badge className={record.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {record.isActive ? '활성' : '비활성'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '작업',
      dataIndex: 'actions',
      render: (value: any, record: User) => (
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleOpenEditModal(record)}
            title="사용자 정보 수정"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">사용자 목록을 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
            <p className="text-muted-foreground">
              시스템 사용자들을 관리하고 권한을 설정하세요
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              일괄 메일
            </Button>
            <Button onClick={handleOpenCreateModal}>
              <UserPlus className="mr-2 h-4 w-4" />
              새 사용자 추가
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="전체 사용자"
            value={stats?.totalUsers || 0}
            icon={Users}
            trend={{
              value: 5,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="활성 사용자"
            value={stats?.activeUsers || 0}
            icon={UserCheck}
            trend={{
              value: 8,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="관리자"
            value={stats?.adminUsers || 0}
            icon={Shield}
            trend={{
              value: 2,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
          <StatCard
            title="이번 달 신규"
            value={stats?.newUsersThisMonth || 0}
            icon={UserPlus}
            trend={{
              value: 12,
              label: "지난 주 대비",
              type: "increase"
            }}
          />
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 검색 및 필터</CardTitle>
            <CardDescription>
              사용자를 검색하고 상태별로 필터링하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="이름, 이메일, 사용자명으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 필터 */}
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">전체 상태</option>
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">전체 역할</option>
                  <option value="ADMIN">관리자</option>
                  <option value="MANAGER">관리자</option>
                  <option value="SUPERVISOR">중간관리자</option>
                  <option value="USER">일반사용자</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>
              총 {filteredUsers.length}명의 사용자가 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredUsers}
              columns={columns}
              searchable={false}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50]
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* 사용자 추가 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">새 사용자 추가</h2>
            
            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium mb-1">이름 *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium mb-1">이메일 *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              {/* 세례명 */}
              <div>
                <label className="block text-sm font-medium mb-1">세례명 *</label>
                <input
                  type="text"
                  value={createForm.baptismalName}
                  onChange={(e) => handleFormChange('baptismalName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="세례명을 입력하세요"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-medium mb-1">비밀번호 *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8자 이상 입력하세요"
                />
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium mb-1">전화번호</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-1234-5678"
                />
              </div>

              {/* 부서 */}
              <div>
                <label className="block text-sm font-medium mb-1">부서</label>
                <input
                  type="text"
                  value={createForm.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="부서명을 입력하세요"
                />
              </div>

              {/* 직책 */}
              <div>
                <label className="block text-sm font-medium mb-1">직책</label>
                <input
                  type="text"
                  value={createForm.position}
                  onChange={(e) => handleFormChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="직책을 입력하세요"
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={handleCloseCreateModal}>
                취소
              </Button>
              <Button onClick={handleCreateUser}>
                사용자 생성
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 수정 모달 */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">사용자 정보 수정</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium mb-1">이름 *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium mb-1">이메일 *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              {/* 세례명 */}
              <div>
                <label className="block text-sm font-medium mb-1">세례명 *</label>
                <input
                  type="text"
                  value={editForm.baptismalName}
                  onChange={(e) => handleEditFormChange('baptismalName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="세례명을 입력하세요"
                />
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium mb-1">전화번호</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-1234-5678"
                />
              </div>

              {/* 부서 */}
              <div>
                <label className="block text-sm font-medium mb-1">부서</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => handleEditFormChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="부서명을 입력하세요"
                />
              </div>

              {/* 직책 */}
              <div>
                <label className="block text-sm font-medium mb-1">직책</label>
                <input
                  type="text"
                  value={editForm.position}
                  onChange={(e) => handleEditFormChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="직책을 입력하세요"
                />
              </div>

              {/* 권한 레벨 */}
              <div>
                <label className="block text-sm font-medium mb-1">권한 레벨 *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => handleEditFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {roleOptions.find(r => r.value === editForm.role)?.description}
                </p>
              </div>

              {/* 활성 상태 */}
              <div>
                <label className="block text-sm font-medium mb-1">계정 상태</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      checked={editForm.isActive === true}
                      onChange={() => handleEditFormChange('isActive', true)}
                      className="mr-2"
                    />
                    활성
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      checked={editForm.isActive === false}
                      onChange={() => handleEditFormChange('isActive', false)}
                      className="mr-2"
                    />
                    비활성
                  </label>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={handleCloseEditModal}>
                취소
              </Button>
              <Button onClick={handleUpdateUser}>
                사용자 수정
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AppLayout>
  );
}
