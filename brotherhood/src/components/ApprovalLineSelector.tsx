'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  X, 
  Users, 
  ArrowRight, 
  UserCheck, 
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { userApi } from '@/services/userApi';
import { useToast } from '@/components/Toast';

// 사용자 정보 타입
interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  branchName: string;
  roles?: string[];
}

// 결재 단계 타입
interface ApprovalStep {
  id: string;
  stepOrder: number;
  stepType: 'REVIEW' | 'APPROVE' | 'CONSULT';
  userId: string;
  userName: string;
  userDisplayName: string;
  isRequired: boolean;
  dueDate?: string;
  isParallel: boolean;
}

// 결재선 타입
interface ApprovalLine {
  id?: string;
  name: string;
  description?: string;
  isParallel: boolean;
  isConditional: boolean;
  steps: ApprovalStep[];
}

interface ApprovalLineSelectorProps {
  value?: ApprovalLine;
  onChange: (approvalLine: ApprovalLine) => void;
  error?: string;
}

// 역할별 한글명 매핑
const roleLabels: Record<string, string> = {
  'ROLE_MEMBER': '일반수도자',
  'ROLE_MANAGER': '중간관리수도자', 
  'ROLE_DIRECTOR': '책임수도자',
  'ROLE_SUPERIOR': '장상',
  'ROLE_ADMIN': '관리자'
};

// 단계 유형별 한글명
const stepTypeLabels: Record<string, string> = {
  'REVIEW': '검토',
  'APPROVE': '승인',
  'CONSULT': '합의'
};

export const ApprovalLineSelector: React.FC<ApprovalLineSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvalLine, setApprovalLine] = useState<ApprovalLine>({
    name: '',
    description: '',
    isParallel: false,
    isConditional: false,
    steps: []
  });

  // 사용자 목록 로드
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await userApi.getUsers({ page: 0, size: 1000 });
        if (response.success && response.data?.content) {
          setUsers(response.data.content);
        }
      } catch (error) {
        console.error('사용자 목록 로드 실패:', error);
        toast({
          title: '오류',
          description: '사용자 목록을 불러오는데 실패했습니다.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  // props에서 값이 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (value) {
      setApprovalLine(value);
    }
  }, [value]);

  // 결재선 정보 업데이트
  const updateApprovalLine = (updates: Partial<ApprovalLine>) => {
    const newApprovalLine = { ...approvalLine, ...updates };
    setApprovalLine(newApprovalLine);
    onChange(newApprovalLine);
  };

  // 결재 단계 추가
  const addStep = () => {
    const newStep: ApprovalStep = {
      id: `step-${Date.now()}`,
      stepOrder: approvalLine.steps.length + 1,
      stepType: 'REVIEW',
      userId: '',
      userName: '',
      userDisplayName: '',
      isRequired: true,
      isParallel: false
    };

    const newSteps = [...approvalLine.steps, newStep];
    updateApprovalLine({ steps: newSteps });
  };

  // 결재 단계 제거
  const removeStep = (stepId: string) => {
    const newSteps = approvalLine.steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, stepOrder: index + 1 }));
    
    updateApprovalLine({ steps: newSteps });
  };

  // 결재 단계 업데이트
  const updateStep = (stepId: string, updates: Partial<ApprovalStep>) => {
    const newSteps = approvalLine.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    updateApprovalLine({ steps: newSteps });
  };

  // 사용자 선택 시 사용자 정보 업데이트
  const handleUserSelect = (stepId: string, userId: string) => {
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser) {
      updateStep(stepId, {
        userId: selectedUser.id,
        userName: selectedUser.username,
        userDisplayName: selectedUser.displayName
      });
    }
  };

  // 역할별 사용자 필터링
  const getUsersByRole = (role: string) => {
    return users.filter(user => user.roles?.includes(role));
  };

  // 권한 매트릭스에 따른 권장 결재선 생성
  const generateRecommendedLine = () => {
    const managers = getUsersByRole('ROLE_MANAGER');
    const directors = getUsersByRole('ROLE_DIRECTOR');
    const superiors = getUsersByRole('ROLE_SUPERIOR');

    const recommendedSteps: ApprovalStep[] = [];

    // 중간관리수도자 단계
    if (managers.length > 0) {
      recommendedSteps.push({
        id: `step-${Date.now()}-1`,
        stepOrder: 1,
        stepType: 'REVIEW',
        userId: managers[0].id,
        userName: managers[0].username,
        userDisplayName: managers[0].displayName,
        isRequired: true,
        isParallel: false
      });
    }

    // 책임수도자 단계
    if (directors.length > 0) {
      recommendedSteps.push({
        id: `step-${Date.now()}-2`,
        stepOrder: 2,
        stepType: 'APPROVE',
        userId: directors[0].id,
        userName: directors[0].username,
        userDisplayName: directors[0].displayName,
        isRequired: true,
        isParallel: false
      });
    }

    // 장상 단계 (최종 승인)
    if (superiors.length > 0) {
      recommendedSteps.push({
        id: `step-${Date.now()}-3`,
        stepOrder: 3,
        stepType: 'APPROVE',
        userId: superiors[0].id,
        userName: superiors[0].username,
        userDisplayName: superiors[0].displayName,
        isRequired: true,
        isParallel: false
      });
    }

    updateApprovalLine({
      name: '권장 결재선',
      steps: recommendedSteps
    });

    toast({
      title: '권장 결재선 생성',
      description: '권한 매트릭스에 따른 권장 결재선이 생성되었습니다.',
      variant: 'success'
    });
  };

  return (
    <Card className={error ? 'border-red-500' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>결재선 지정</span>
        </CardTitle>
        <CardDescription>
          문서의 결재 흐름을 설정하세요. 일반수도자 → 중간관리수도자 → 책임수도자 → 장상 순으로 진행됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 결재선 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">결재선 이름</label>
            <Input
              placeholder="예: 일반 결재선"
              value={approvalLine.name}
              onChange={(e) => updateApprovalLine({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">설명</label>
            <Input
              placeholder="결재선 설명 (선택사항)"
              value={approvalLine.description || ''}
              onChange={(e) => updateApprovalLine({ description: e.target.value })}
            />
          </div>
        </div>

        {/* 옵션 설정 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="parallel"
              checked={approvalLine.isParallel}
              onCheckedChange={(checked) => updateApprovalLine({ isParallel: !!checked })}
            />
            <label htmlFor="parallel" className="text-sm font-medium">
              병렬 결재
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="conditional"
              checked={approvalLine.isConditional}
              onCheckedChange={(checked) => updateApprovalLine({ isConditional: !!checked })}
            />
            <label htmlFor="conditional" className="text-sm font-medium">
              조건부 결재
            </label>
          </div>
        </div>

        {/* 권장 결재선 생성 버튼 */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateRecommendedLine}
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>권장 결재선 생성</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStep}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>단계 추가</span>
          </Button>
        </div>

        {/* 결재 단계 목록 */}
        {approvalLine.steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">결재 단계</h4>
            {approvalLine.steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">단계 {step.stepOrder}</Badge>
                    {step.isRequired && (
                      <Badge variant="destructive">필수</Badge>
                    )}
                    {step.isParallel && (
                      <Badge variant="secondary">병렬</Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  {/* 단계 유형 - 그대로 */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium">유형</label>
                    <Select
                      value={step.stepType}
                      onValueChange={(value: 'REVIEW' | 'APPROVE' | 'CONSULT') => 
                        updateStep(step.id, { stepType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REVIEW">검토</SelectItem>
                        <SelectItem value="APPROVE">승인</SelectItem>
                        <SelectItem value="CONSULT">합의</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 결재자 선택 - width 늘림 */}
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium">결재자</label>
                    <Select
                      value={step.userId}
                      onValueChange={(value) => handleUserSelect(step.id, value)}
                    >
                      <SelectTrigger className="min-w-0">
                        <SelectValue placeholder="결재자 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex flex-col w-full">
                              <span className="font-medium break-words">{user.displayName}</span>
                              <span className="text-xs text-muted-foreground break-words">
                                {user.roles?.map(role => roleLabels[role]).join(', ')} - {user.branchName}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 마감일 - left와 width 조정 */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">마감일</label>
                    <Input
                      type="date"
                      value={step.dueDate || ''}
                      onChange={(e) => updateStep(step.id, { dueDate: e.target.value })}
                      className="text-sm w-full"
                    />
                  </div>
                </div>

                {/* 옵션 */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${step.id}`}
                      checked={step.isRequired}
                      onCheckedChange={(checked) => updateStep(step.id, { isRequired: !!checked })}
                    />
                    <label htmlFor={`required-${step.id}`} className="text-sm">
                      필수 단계
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`parallel-${step.id}`}
                      checked={step.isParallel}
                      onCheckedChange={(checked) => updateStep(step.id, { isParallel: !!checked })}
                    />
                    <label htmlFor={`parallel-${step.id}`} className="text-sm">
                      병렬 처리
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 결재 흐름 미리보기 */}
        {approvalLine.steps.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">결재 흐름 미리보기</h4>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {approvalLine.steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center space-y-2 min-w-[140px] max-w-[180px] p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-1">
                      {step.stepType === 'REVIEW' && <UserCheck className="h-4 w-4 text-blue-600" />}
                      {step.stepType === 'APPROVE' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {step.stepType === 'CONSULT' && <Clock className="h-4 w-4 text-orange-600" />}
                      <span className="text-xs font-medium">
                        {stepTypeLabels[step.stepType]}
                      </span>
                    </div>
                    <div className="text-xs text-center break-words">
                      <div className="font-medium">
                        {step.userDisplayName || '결재자 미선택'}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {step.isRequired && (
                        <Badge variant="destructive" className="text-xs px-1 py-0">필수</Badge>
                      )}
                      {step.isParallel && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">병렬</Badge>
                      )}
                    </div>
                  </div>
                  {index < approvalLine.steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
