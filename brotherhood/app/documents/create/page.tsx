'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FormField } from '@/components/FormField';
import SuccessModal from '@/components/SuccessModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Send, 
  Upload, 
  X, 
  Plus, 
  FileText,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApprovalLineSelector } from '@/components/ApprovalLineSelector';

// 결재선 타입
interface ApprovalLine {
  id?: string;
  name: string;
  description?: string;
  isParallel: boolean;
  isConditional: boolean;
  steps: ApprovalStep[];
}

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

// 문서 작성 폼 데이터 타입
interface DocumentFormData {
  title: string;
  content: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  tags: string[];
  isUrgent: boolean;
  requiresApproval: boolean;
  attachments: File[];
  approvalLine?: ApprovalLine;
}

// 카테고리 옵션
const categories = [
  { value: 'meeting', label: '회의록' },
  { value: 'report', label: '보고서' },
  { value: 'proposal', label: '제안서' },
  { value: 'plan', label: '계획서' },
  { value: 'result', label: '결과보고서' },
  { value: 'memo', label: '메모' },
  { value: 'notice', label: '공지사항' },
];

// 우선순위 옵션
const priorities = [
  { value: 'LOW', label: '낮음', color: 'bg-gray-100 text-gray-600' },
  { value: 'MEDIUM', label: '보통', color: 'bg-yellow-100 text-yellow-600' },
  { value: 'HIGH', label: '높음', color: 'bg-red-100 text-red-600' },
];

export default function CreateDocumentPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    content: '',
    category: '',
    priority: 'MEDIUM',
    dueDate: '',
    tags: [],
    isUrgent: false,
    requiresApproval: true,
    attachments: [],
    approvalLine: undefined,
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof DocumentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 태그 추가
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // 파일 첨부
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateFormData('attachments', [...formData.attachments, ...files]);
  };

  // 파일 제거
  const removeAttachment = (index: number) => {
    updateFormData('attachments', formData.attachments.filter((_, i) => i !== index));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }
    if (formData.requiresApproval && (!formData.approvalLine || formData.approvalLine.steps.length === 0)) {
      newErrors.approvalLine = '승인이 필요한 문서는 결재선을 지정해야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 임시 저장
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 임시 저장 로직 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('임시 저장:', formData);
      alert('임시 저장되었습니다.');
    } catch (error) {
      console.error('임시 저장 실패:', error);
      alert('임시 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 문서 제출
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 실제 API 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api'}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id || 'ac31e829-d5c6-4a1d-92de-439178b12f5f', // admin 사용자 ID
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          classification: formData.category, // category를 classification으로 매핑
          isUrgent: formData.isUrgent,
          approvalLines: formData.approvalLine ? [{
            name: formData.approvalLine.name,
            description: formData.approvalLine.description,
            isParallel: formData.approvalLine.isParallel,
            isConditional: formData.approvalLine.isConditional,
            approvalSteps: formData.approvalLine.steps.map(step => ({
              stepOrder: step.stepOrder,
              stepType: step.stepType,
              approverId: step.userId,
              isRequired: step.isRequired,
              dueDate: step.dueDate,
              isParallel: step.isParallel
            }))
          }] : [],
          // branchId는 백엔드에서 author의 branch로 자동 설정되므로 제외
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('문서 제출 성공:', result);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('문서 제출 실패:', error);
      alert('문서 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 성공 모달 핸들러
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/documents?refresh=true');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">새 문서 작성</h1>
            <p className="text-muted-foreground">
              새로운 문서를 작성하고 제출하세요
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/documents">
                <X className="mr-2 h-4 w-4" />
                취소
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 폼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>기본 정보</span>
                </CardTitle>
                <CardDescription>
                  문서의 기본 정보를 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="제목"
                  required
                  error={errors.title}
                >
                  <Input
                    placeholder="문서 제목을 입력하세요"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="카테고리"
                    required
                    error={errors.category}
                  >
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => updateFormData('category', value)}
                    >
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="우선순위">
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => updateFormData('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <Badge className={priority.color}>
                                {priority.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField
                  label="마감일"
                >
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => updateFormData('dueDate', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </FormField>

                <FormField
                  label="태그"
                >
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="태그 입력"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </FormField>
              </CardContent>
            </Card>

            {/* 문서 내용 */}
            <Card>
              <CardHeader>
                <CardTitle>문서 내용</CardTitle>
                <CardDescription>
                  문서의 상세 내용을 작성하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  label="내용"
                  required
                  error={errors.content}
                >
                  <Textarea
                    placeholder="문서 내용을 입력하세요..."
                    value={formData.content}
                    onChange={(e) => updateFormData('content', e.target.value)}
                    className={`min-h-[300px] ${errors.content ? 'border-red-500' : ''}`}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* 결재선 지정 */}
            {formData.requiresApproval && (
              <ApprovalLineSelector
                value={formData.approvalLine}
                onChange={(approvalLine) => updateFormData('approvalLine', approvalLine)}
                error={errors.approvalLine}
              />
            )}

            {/* 첨부 파일 */}
            <Card>
              <CardHeader>
                <CardTitle>첨부 파일</CardTitle>
                <CardDescription>
                  관련 파일을 첨부하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        파일 선택
                      </label>
                    </Button>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">첨부된 파일</h4>
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 작성자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>작성자</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{user?.displayName || '테스트 사용자'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'test@example.com'}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.branchName || '서울지사'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 옵션 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>옵션 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={formData.isUrgent}
                    onCheckedChange={(checked) => updateFormData('isUrgent', checked)}
                  />
                  <label htmlFor="urgent" className="text-sm font-medium">
                    긴급 문서
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approval"
                    checked={formData.requiresApproval}
                    onCheckedChange={(checked) => updateFormData('requiresApproval', checked)}
                  />
                  <label htmlFor="approval" className="text-sm font-medium">
                    승인 필요
                  </label>
                </div>

                {formData.isUrgent && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">긴급 문서</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      긴급 문서는 우선적으로 처리됩니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <Card>
              <CardHeader>
                <CardTitle>문서 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="mr-2 h-4 w-4" />
                  임시 저장
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      제출 중...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      문서 제출
                    </>
                  )}
                </Button>

                {formData.requiresApproval && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">승인 필요</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      이 문서는 승인 절차를 거쳐야 합니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="문서 작성 완료"
        message="문서가 성공적으로 제출되었습니다. 문서 목록에서 확인하실 수 있습니다."
        buttonText="문서 목록으로 이동"
      />
    </AppLayout>
  );
}
