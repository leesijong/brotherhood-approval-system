'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  ArrowRight,
  AlertCircle,
  Calendar,
  MessageSquare
} from 'lucide-react';

// 결재선 타입
interface ApprovalLine {
  id: string;
  name: string;
  description?: string;
  isParallel: boolean;
  isConditional: boolean;
  approvalSteps?: ApprovalStep[]; // 선택적 필드로 변경
  createdAt: string;
  updatedAt: string;
}

// 결재단계 타입
interface ApprovalStep {
  id: string;
  stepOrder: number;
  approverType: string;
  isRequired: boolean;
  isDelegatable: boolean;
  maxDelegationLevel: number;
  approvalLineId: string;
  approverId: string;
  approverName: string;
  approverDisplayName: string;
  delegatedToId?: string;
  delegatedToName?: string;
  delegatedToDisplayName?: string;
  status?: string;
  comments?: string;
  approvedAt?: string;
  rejectedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApprovalProgressProps {
  approvalLines: ApprovalLine[];
  documentStatus: string;
}

// 상태별 색상 매핑
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-500',
  APPROVED: 'bg-green-100 text-green-800 border-green-500',
  REJECTED: 'bg-red-100 text-red-800 border-red-500',
  DELEGATED: 'bg-blue-100 text-blue-800 border-blue-500',
  RETURNED: 'bg-gray-100 text-gray-800 border-gray-500',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-500',
};

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
  DELEGATED: '위임됨',
  RETURNED: '반려됨',
  CANCELLED: '취소됨',
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  REJECTED: <XCircle className="h-4 w-4" />,
  DELEGATED: <User className="h-4 w-4" />,
  RETURNED: <XCircle className="h-4 w-4" />,
  CANCELLED: <AlertCircle className="h-4 w-4" />,
};

export function ApprovalProgress({ approvalLines, documentStatus }: ApprovalProgressProps) {
  console.log('ApprovalProgress - approvalLines:', approvalLines);
  
  if (!approvalLines || approvalLines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>승인 진행 상황</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>결재선이 설정되지 않았습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 결재선이 있지만 모든 결재선의 approvalSteps가 비어있는 경우
  const hasAnySteps = approvalLines.some(line => line.approvalSteps && line.approvalSteps.length > 0);
  if (!hasAnySteps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>승인 진행 상황</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>결재 단계가 설정되지 않았습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 모든 결재단계를 하나의 배열로 합치고 정렬
  const allSteps = approvalLines
    .flatMap(line => (line.approvalSteps || []).map(step => ({
      ...step,
      lineName: line.name,
      isParallel: line.isParallel,
      isConditional: line.isConditional
    })))
    .sort((a, b) => a.stepOrder - b.stepOrder);

  // 고유한 결재자별로 그룹화 (중복 제거)
  const uniqueApprovers = new Map();
  allSteps.forEach(step => {
    const key = `${step.approverId}-${step.stepOrder}`;
    if (!uniqueApprovers.has(key)) {
      uniqueApprovers.set(key, step);
    } else {
      // 같은 결재자의 경우, APPROVED 상태가 있으면 우선
      const existing = uniqueApprovers.get(key);
      if (step.status === 'APPROVED' && existing.status !== 'APPROVED') {
        uniqueApprovers.set(key, step);
      }
    }
  });

  const uniqueSteps = Array.from(uniqueApprovers.values()).sort((a, b) => a.stepOrder - b.stepOrder);
  
  // 디버깅을 위한 로그
  console.log('ApprovalProgress Debug:', {
    allSteps: allSteps.length,
    uniqueSteps: uniqueSteps.length,
    documentStatus,
    uniqueStepsData: uniqueSteps.map(s => ({ id: s.id, status: s.status, approver: s.approverDisplayName }))
  });

  // 현재 진행 중인 단계 찾기
  const currentStepIndex = uniqueSteps.findIndex(step => step.status === 'PENDING');
  
  // 진행률 계산 (고유한 결재자 기준)
  const approvedSteps = uniqueSteps.filter(step => step.status === 'APPROVED').length;
  const totalSteps = uniqueSteps.length;
  const progressPercentage = totalSteps > 0 ? (approvedSteps / totalSteps) * 100 : 0;
  
  // 완료 상태 판단: 모든 필수 단계가 승인되었거나, 문서 상태가 APPROVED인 경우
  const isCompleted = uniqueSteps.every(step => step.status === 'APPROVED') || 
                     (documentStatus === 'APPROVED' && approvedSteps > 0);
  const isRejected = uniqueSteps.some(step => step.status === 'REJECTED') || 
                     documentStatus === 'REJECTED';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>승인 진행 상황</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 전체 진행률 표시 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">전체 진행률</span>
              <Badge variant="outline">
                {approvedSteps} / {totalSteps}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  완료
                </Badge>
              )}
              {isRejected && (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  반려됨
                </Badge>
              )}
              {!isCompleted && !isRejected && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  진행중
                </Badge>
              )}
            </div>
          </div>

          {/* 결재선별 진행 상황 */}
          {approvalLines.map((line, lineIndex) => {
            // 해당 결재선의 고유한 단계들만 필터링
            const lineSteps = uniqueSteps.filter(step => step.approvalLineId === line.id);
            
            return (
            <div key={line.id} className="space-y-3">
              {/* 결재선 헤더 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{line.name}</span>
                {line.isParallel && (
                  <Badge variant="secondary" className="text-xs">
                    병렬
                  </Badge>
                )}
                {line.isConditional && (
                  <Badge variant="outline" className="text-xs">
                    조건부
                  </Badge>
                )}
              </div>

              {/* 결재단계들 */}
              <div className="space-y-2">
                {lineSteps
                  .sort((a, b) => a.stepOrder - b.stepOrder)
                  .map((step, stepIndex) => {
                    const isCurrentStep = step.status === 'PENDING';
                    const isCompleted = step.status === 'APPROVED';
                    const isRejected = step.status === 'REJECTED';
                    const isDelegated = step.status === 'DELEGATED';

                    return (
                      <div key={step.id} className="flex items-start space-x-3">
                        {/* 단계 번호 */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted ? 'bg-green-100 text-green-800' :
                          isRejected ? 'bg-red-100 text-red-800' :
                          isCurrentStep ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {step.stepOrder}
                        </div>

                        {/* 단계 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium truncate">
                                {step.approverDisplayName || step.approverName}
                              </span>
                              {isDelegated && step.delegatedToDisplayName && (
                                <>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground truncate">
                                    {step.delegatedToDisplayName}
                                  </span>
                                </>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                statusColors[step.status || 'PENDING']
                              }`}
                            >
                              {statusIcons[step.status || 'PENDING']}
                              <span className="ml-1">
                                {statusLabels[step.status || 'PENDING']}
                              </span>
                            </Badge>
                          </div>

                          {/* 상세 정보 */}
                          <div className="mt-1 space-y-1">
                            {/* 댓글 */}
                            {step.comments && (
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">{step.comments}</p>
                              </div>
                            )}

                            {/* 승인/반려 시간 */}
                            {step.approvedAt && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(step.approvedAt).toLocaleString('ko-KR')}
                                </span>
                              </div>
                            )}
                            {step.rejectedAt && (
                              <div className="flex items-center space-x-2">
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(step.rejectedAt).toLocaleString('ko-KR')}
                                </span>
                              </div>
                            )}

                            {/* 마감일 (대기중인 경우만) */}
                            {step.status === 'PENDING' && step.dueDate && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3 text-orange-600" />
                                <span className="text-xs text-orange-600">
                                  마감: {new Date(step.dueDate).toLocaleString('ko-KR')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* 결재선 간 구분선 */}
              {lineIndex < approvalLines.length - 1 && (
                <div className="border-t border-gray-200 my-4"></div>
              )}
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
