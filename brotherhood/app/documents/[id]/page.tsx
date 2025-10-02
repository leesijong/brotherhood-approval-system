'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Share, 
  Printer, 
  MessageSquare,
  Clock,
  User,
  Calendar,
  FileText,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Eye,
  EyeOff,
  Send,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { documentApi } from '@/services/documentApi';
import { approvalApi } from '@/services/approvalApi';
import { useToast } from '@/components/Toast';
import { AttachmentDownloader } from '@/components/AttachmentDownloader';
import { ApprovalProgress } from '@/components/ApprovalProgress';
import { ApprovalAction, ApprovalActionRequest } from '@/types/approval';

// 첨부파일 타입
interface Attachment {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  documentId: string;
  uploadedBy: string;
  name: string;
  size: number;
  type: string;
}

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

// 문서 타입
interface Document {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  author: string;
  authorId: string;
  authorName?: string;
  authorDisplayName?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  documentType?: string;
  tags: string[];
  attachments: Attachment[];
  approvalHistory: ApprovalStep[];
  approvalLines?: ApprovalLine[]; // 새로 추가
  comments: Comment[];
  isUrgent: boolean;
  requiresApproval: boolean;
  documentNumber?: string;
  version?: number;
  securityLevel?: string;
  branchName?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

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

interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

// 상태별 색상 매핑
const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '초안',
  PENDING: '검토중',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
  ARCHIVED: '보관됨',
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

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 첨부파일 로드 함수
  const loadAttachments = async (documentId: string) => {
    if (!user) return;
    
    try {
      setLoadingAttachments(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api'}/documents/${documentId}/attachments`, {
        headers: { 'X-User-Id': user.id || 'ac31e829-d5c6-4a1d-92de-439178b12f5f' }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setAttachments(result.data);
      }
    } catch (error) {
      console.error('첨부파일 로드 오류:', error);
    } finally {
      setLoadingAttachments(false);
    }
  };


  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 문서 데이터 로드
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출
        if (!params?.id) {
          throw new Error('문서 ID가 없습니다.');
        }
        
        console.log('문서 상세 조회 시작:', { 
          documentId: params.id, 
          apiUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api'}/documents/${params.id}` 
        });
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api'}/documents/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('문서 데이터 응답:', { 
          success: result.success, 
          documentId: result.data?.id, 
          title: result.data?.title,
          fullResponse: result 
        });
        
        if (result.success && result.data) {
          const apiDocument = result.data;
          const document: Document = {
            id: apiDocument.id,
            title: apiDocument.title,
            content: apiDocument.content,
            status: apiDocument.status,
            author: apiDocument.authorName || apiDocument.authorDisplayName || 'Unknown',
            authorId: apiDocument.authorId,
            authorName: apiDocument.authorName,
            authorDisplayName: apiDocument.authorDisplayName,
            createdAt: apiDocument.createdAt,
            updatedAt: apiDocument.updatedAt,
            dueDate: apiDocument.dueDate,
            priority: apiDocument.priority || 'MEDIUM',
            category: apiDocument.documentType || 'Unknown',
            documentType: apiDocument.documentType,
            tags: apiDocument.tags || [],
            attachments: apiDocument.attachments || [],
            approvalHistory: apiDocument.approvalLines || [],
            approvalLines: apiDocument.approvalLines || [],
            comments: apiDocument.comments || [],
            isUrgent: apiDocument.isUrgent || false,
            requiresApproval: true,
            documentNumber: apiDocument.documentNumber,
            version: apiDocument.version || 1,
            securityLevel: apiDocument.securityLevel || 'NORMAL',
            branchName: apiDocument.branchName || 'Unknown',
            submittedAt: apiDocument.submittedAt,
            approvedAt: apiDocument.approvedAt,
            rejectedAt: apiDocument.rejectedAt,
            rejectionReason: apiDocument.rejectionReason,
          };
          setDocument(document);
          // 첨부파일 로드
          await loadAttachments(document.id);
        } else {
          throw new Error(result.message || '문서를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('문서 로드 실패:', error);
        // API 실패 시 모의 데이터 사용
        const mockDocument: Document = {
          id: params?.id as string,
          title: `문서 ${params?.id} (API 오류)`,
          content: `
# 2024년 3분기 사업 계획서

## 1. 개요
본 문서는 2024년 3분기 사업 계획에 대한 상세 내용을 다룹니다.

## 2. 주요 목표
- 매출 목표: 전년 대비 15% 증가
- 신규 고객 확보: 월 평균 50명
- 고객 만족도: 90% 이상 유지

## 3. 세부 계획

### 3.1 마케팅 계획
- 디지털 마케팅 강화
- 소셜 미디어 캠페인 진행
- 고객 리텐션 프로그램 도입

### 3.2 운영 계획
- 인력 충원 계획
- 시스템 개선 작업
- 프로세스 최적화

## 4. 예산 계획
- 마케팅 예산: 5억원
- 운영 예산: 3억원
- 개발 예산: 2억원

## 5. 리스크 관리
- 시장 변화 대응 방안
- 경쟁사 대응 전략
- 인력 부족 대비책
          `,
          status: 'PENDING',
          author: '김철수',
          authorId: 'user-1',
          authorName: '김철수',
          authorDisplayName: '김철수 (1번 사용자)',
          createdAt: '2024-09-15T09:00:00Z',
          updatedAt: '2024-09-18T14:30:00Z',
          dueDate: '2024-09-25T18:00:00Z',
          priority: 'HIGH',
          category: '계획서',
          documentType: '계획서',
          tags: ['3분기', '사업계획', '긴급'],
          attachments: [
            {
              id: 'att-1',
              filename: '3분기_예산계획.xlsx',
              originalFilename: '3분기_예산계획.xlsx',
              fileSize: 1024000,
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              uploadedAt: '2024-09-15T10:00:00Z',
              documentId: params?.id as string,
              uploadedBy: '김철수',
              name: '3분기_예산계획.xlsx',
              size: 1024000,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            {
              id: 'att-2',
              filename: '마케팅_전략.pdf',
              originalFilename: '마케팅_전략.pdf',
              fileSize: 2048000,
              mimeType: 'application/pdf',
              uploadedAt: '2024-09-15T11:00:00Z',
              documentId: params?.id as string,
              uploadedBy: '김철수',
              name: '마케팅_전략.pdf',
              size: 2048000,
              type: 'application/pdf'
            }
          ],
          approvalHistory: [
            {
              id: 'step-1',
              stepOrder: 1,
              approverType: 'PERSON',
              isRequired: true,
              isDelegatable: true,
              maxDelegationLevel: 1,
              approvalLineId: 'line-1',
              approverId: 'user-2',
              approverName: '이영희',
              approverDisplayName: '이영희 (부장)',
              status: 'APPROVED',
              comments: '전반적으로 잘 작성되었습니다.',
              approvedAt: '2024-09-16T10:00:00Z',
              dueDate: '2024-09-17T18:00:00Z',
              createdAt: '2024-09-15T09:00:00Z',
              updatedAt: '2024-09-16T10:00:00Z'
            },
            {
              id: 'step-2',
              stepOrder: 2,
              approverType: 'PERSON',
              isRequired: true,
              isDelegatable: true,
              maxDelegationLevel: 1,
              approvalLineId: 'line-1',
              approverId: 'user-3',
              approverName: '박민수',
              approverDisplayName: '박민수 (이사)',
              status: 'PENDING',
              dueDate: '2024-09-20T18:00:00Z',
              createdAt: '2024-09-15T09:00:00Z',
              updatedAt: '2024-09-15T09:00:00Z'
            },
            {
              id: 'step-3',
              stepOrder: 3,
              approverType: 'PERSON',
              isRequired: true,
              isDelegatable: true,
              maxDelegationLevel: 1,
              approvalLineId: 'line-1',
              approverId: 'user-4',
              approverName: '정수진',
              approverDisplayName: '정수진 (대표)',
              status: 'PENDING',
              dueDate: '2024-09-22T18:00:00Z',
              createdAt: '2024-09-15T09:00:00Z',
              updatedAt: '2024-09-15T09:00:00Z'
            }
          ],
          approvalLines: [
            {
              id: 'line-1',
              name: '3분기 사업계획서 결재선',
              description: '2024년 3분기 사업계획서 승인을 위한 결재선',
              isParallel: false,
              isConditional: false,
              approvalSteps: [
                {
                  id: 'step-1',
                  stepOrder: 1,
                  approverType: 'PERSON',
                  isRequired: true,
                  isDelegatable: true,
                  maxDelegationLevel: 1,
                  approvalLineId: 'line-1',
                  approverId: 'user-2',
                  approverName: '이영희',
                  approverDisplayName: '이영희 (부장)',
                  status: 'APPROVED',
                  comments: '전반적으로 잘 작성되었습니다.',
                  approvedAt: '2024-09-16T10:00:00Z',
                  dueDate: '2024-09-17T18:00:00Z',
                  createdAt: '2024-09-15T09:00:00Z',
                  updatedAt: '2024-09-16T10:00:00Z'
                },
                {
                  id: 'step-2',
                  stepOrder: 2,
                  approverType: 'PERSON',
                  isRequired: true,
                  isDelegatable: true,
                  maxDelegationLevel: 1,
                  approvalLineId: 'line-1',
                  approverId: 'user-3',
                  approverName: '박민수',
                  approverDisplayName: '박민수 (이사)',
                  status: 'PENDING',
                  dueDate: '2024-09-20T18:00:00Z',
                  createdAt: '2024-09-15T09:00:00Z',
                  updatedAt: '2024-09-15T09:00:00Z'
                },
                {
                  id: 'step-3',
                  stepOrder: 3,
                  approverType: 'PERSON',
                  isRequired: true,
                  isDelegatable: true,
                  maxDelegationLevel: 1,
                  approvalLineId: 'line-1',
                  approverId: 'user-4',
                  approverName: '정수진',
                  approverDisplayName: '정수진 (대표)',
                  status: 'PENDING',
                  dueDate: '2024-09-22T18:00:00Z',
                  createdAt: '2024-09-15T09:00:00Z',
                  updatedAt: '2024-09-15T09:00:00Z'
                }
              ],
              createdAt: '2024-09-15T09:00:00Z',
              updatedAt: '2024-09-15T09:00:00Z'
            }
          ],
          comments: [
            {
              id: 'comment-1',
              author: '이영희',
              authorId: 'user-2',
              content: '예산 계획 부분을 좀 더 상세히 작성해 주시면 좋겠습니다.',
              createdAt: '2024-09-16T10:30:00Z',
              isInternal: false
            },
            {
              id: 'comment-2',
              author: '박민수',
              authorId: 'user-3',
              content: '마케팅 전략이 구체적이지 않네요. 더 자세한 계획이 필요합니다.',
              createdAt: '2024-09-17T14:00:00Z',
              isInternal: true
            }
          ],
          isUrgent: true,
          requiresApproval: true,
          documentNumber: `DOC-${params?.id}`,
          version: 1,
          securityLevel: 'NORMAL',
          branchName: '본사',
          submittedAt: '2024-09-15T09:00:00Z',
          approvedAt: undefined,
          rejectedAt: undefined,
          rejectionReason: undefined
        };

        setDocument(mockDocument);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadDocument();
    }
  }, [params?.id]);

  // 댓글 추가
  const handleAddComment = async () => {
    if (!newComment.trim() || !document) return;

    setIsAddingComment(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        author: user?.displayName || '테스트 사용자',
        authorId: user?.id || 'user-1',
        content: newComment,
        createdAt: new Date().toISOString(),
        isInternal: false
      };

      setDocument(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);
      
      setNewComment('');
    } catch (error) {
      console.error('댓글 추가 실패:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  // 파일 다운로드
  const handleDownload = (attachment: Attachment) => {
    console.log('파일 다운로드:', attachment);
    // 실제로는 파일 다운로드 로직
  };

  // 현재 사용자가 결재할 수 있는 결재단계 찾기
  const findPendingApprovalStepForUser = (document: Document, userId: string): ApprovalStep | null => {
    if (!document.approvalLines) return null;
    
    for (const approvalLine of document.approvalLines) {
      if (approvalLine.approvalSteps) {
        for (const step of approvalLine.approvalSteps) {
          if (step.approverId === userId && step.status === 'PENDING') {
            return step;
          }
        }
      }
    }
    return null;
  };

  // 상태 변경 함수들
  const handleSubmitDocument = async () => {
    if (!document) return;
    
    try {
      const response = await documentApi.submitDocument(document.id);
      if (response.success) {
        setDocument(prev => prev ? { ...prev, status: 'PENDING' } : null);
        toast({ title: '문서가 상신되었습니다.', variant: 'success' });
      } else {
        toast({ title: response.message || '상신에 실패했습니다.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('문서 상신 실패:', error);
      toast({ title: '문서 상신 중 오류가 발생했습니다.', variant: 'destructive' });
    }
  };

  const handleApproveDocument = async () => {
    if (!document || !user) return;
    
    try {
      // 현재 사용자가 결재할 수 있는 결재단계 찾기
      const pendingStep = findPendingApprovalStepForUser(document, user.id);
      
      if (!pendingStep) {
        toast({ title: '결재할 수 있는 단계가 없습니다.', variant: 'destructive' });
        return;
      }
      
      // 개별 결재단계 승인 API 호출
      const actionRequest: ApprovalActionRequest = {
        action: ApprovalAction.APPROVE,
        comments: '승인합니다.'
      };
      
      const response = await approvalApi.processApproval(pendingStep.id, actionRequest);
      
      if (response.success) {
        // 문서 데이터 새로고침
        const documentResponse = await documentApi.getDocument(document.id);
        if (documentResponse.success && documentResponse.data) {
          setDocument(documentResponse.data as any);
        }
        toast({ title: '문서가 승인되었습니다.', variant: 'success' });
      } else {
        toast({ title: response.message || '승인에 실패했습니다.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('문서 승인 실패:', error);
      toast({ title: '문서 승인 중 오류가 발생했습니다.', variant: 'destructive' });
    }
  };

  const handleRejectDocument = async () => {
    if (!document || !user) return;
    
    const rejectionReason = prompt('반려 사유를 입력해주세요:');
    if (!rejectionReason) return;
    
    try {
      // 현재 사용자가 결재할 수 있는 결재단계 찾기
      const pendingStep = findPendingApprovalStepForUser(document, user.id);
      
      if (!pendingStep) {
        toast({ title: '반려할 수 있는 단계가 없습니다.', variant: 'destructive' });
        return;
      }
      
      // 개별 결재단계 반려 API 호출
      const actionRequest: ApprovalActionRequest = {
        action: ApprovalAction.REJECT,
        comments: rejectionReason
      };
      
      const response = await approvalApi.processApproval(pendingStep.id, actionRequest);
      
      if (response.success) {
        // 문서 데이터 새로고침
        const documentResponse = await documentApi.getDocument(document.id);
        if (documentResponse.success && documentResponse.data) {
          setDocument(documentResponse.data as any);
        }
        toast({ title: '문서가 반려되었습니다.', variant: 'success' });
      } else {
        toast({ title: response.message || '반려에 실패했습니다.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('문서 반려 실패:', error);
      toast({ title: '문서 반려 중 오류가 발생했습니다.', variant: 'destructive' });
    }
  };

  const handleRecallDocument = async () => {
    if (!document) return;
    
    try {
      const response = await documentApi.recallDocument(document.id);
      if (response.success) {
        setDocument(prev => prev ? { ...prev, status: 'DRAFT' } : null);
        toast({ title: '문서가 회수되었습니다.', variant: 'success' });
      } else {
        toast({ title: response.message || '회수에 실패했습니다.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('문서 회수 실패:', error);
      toast({ title: '문서 회수 중 오류가 발생했습니다.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">문서를 불러오는 중...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!document) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">문서를 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              요청하신 문서가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button asChild>
              <Link href="/documents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                문서 목록으로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
              <p className="text-muted-foreground">
                작성자: {document.authorDisplayName || document.authorName || document.author} • {new Date(document.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 상태 변경 버튼들 */}
            {document.status === 'DRAFT' && document.authorId === user?.id && (
              <Button onClick={handleSubmitDocument} size="sm">
                <Send className="mr-2 h-4 w-4" />
                상신
              </Button>
            )}
            
            {document.status === 'PENDING' && (
              <>
                {/* 승인/반려는 작성자가 아닌 다른 사용자만 가능하고, 결재할 수 있는 단계가 있을 때만 */}
                {document.authorId !== user?.id && user && findPendingApprovalStepForUser(document, user.id) && (
                  <>
                    <Button onClick={handleApproveDocument} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      승인
                    </Button>
                    <Button onClick={handleRejectDocument} size="sm" variant="destructive">
                      <X className="mr-2 h-4 w-4" />
                      반려
                    </Button>
                  </>
                )}
                {/* 회수는 작성자만 가능 */}
                {document.authorId === user?.id && (
                  <Button onClick={handleRecallDocument} size="sm" variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    회수
                  </Button>
                )}
              </>
            )}
            
            {/* 기존 버튼들 */}
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              인쇄
            </Button>
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              공유
            </Button>
            {document.status === 'DRAFT' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/documents/${document.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  수정
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 문서 정보 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>문서 정보</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[document.status]}>
                      {statusLabels[document.status]}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[document.priority]}>
                      {priorityLabels[document.priority]}
                    </Badge>
                    {document.isUrgent && (
                      <Badge variant="destructive">
                        긴급
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">작성일:</span>
                    <span>{new Date(document.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">수정일:</span>
                    <span>{new Date(document.updatedAt).toLocaleString('ko-KR')}</span>
                  </div>
                  {document.dueDate && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">마감일:</span>
                      <span>{new Date(document.dueDate).toLocaleString('ko-KR')}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">카테고리:</span>
                    <span>{document.documentType || document.category}</span>
                  </div>
                </div>
                
                {document.tags && document.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 문서 내용 */}
            <Card>
              <CardHeader>
                <CardTitle>문서 내용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {document.content}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* 첨부 파일 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  첨부 파일
                </CardTitle>
                <CardDescription>
                  문서와 관련된 첨부 파일입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAttachments ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">첨부파일을 불러오는 중...</p>
                  </div>
                ) : attachments && attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">
                              {attachment.originalFilename}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.fileSize)} • {new Date(attachment.uploadedAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>
                        <AttachmentDownloader 
                          attachment={attachment}
                          userId={user?.id}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>첨부된 파일이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 댓글 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>댓글 ({document.comments ? document.comments.length : 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 댓글 목록 */}
                {document.comments && document.comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-muted pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{comment.author}</span>
                        {comment.isInternal && (
                          <Badge variant="outline" className="text-xs">
                            내부
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}

                {/* 댓글 작성 */}
                <div className="border-t pt-4">
                  <Textarea
                    placeholder="댓글을 입력하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={isAddingComment || !newComment.trim()}
                    size="sm"
                  >
                    {isAddingComment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        추가 중...
                      </>
                    ) : (
                      '댓글 추가'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 승인 진행 상황 */}
            {document.requiresApproval && (
              <ApprovalProgress 
                approvalLines={document.approvalLines || []} 
                documentStatus={document.status}
              />
            )}

            {/* 문서 액션 */}
            <Card>
              <CardHeader>
                <CardTitle>문서 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  문서 다운로드
                </Button>
                
                {document.status === 'PENDING' && (
                  <>
                    <Button className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      승인
                    </Button>
                    <Button className="w-full" variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      반려
                    </Button>
                  </>
                )}

                <Button className="w-full" variant="outline">
                  <History className="mr-2 h-4 w-4" />
                  이력 보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
