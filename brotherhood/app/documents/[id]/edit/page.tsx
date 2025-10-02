'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  FileText,
  AlertCircle,
  CheckCircle,
  Paperclip,
  Trash2,
  Plus,
  Download
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { AttachmentDownloader } from '@/components/AttachmentDownloader';
import { DeleteConfirmDialog } from '@/components/ConfirmDialog';

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
  isUrgent: boolean;
  documentNumber?: string;
  version?: number;
  securityLevel?: string;
  branchName?: string;
  attachments?: Attachment[];
}

// 폼 데이터 타입
interface DocumentFormData {
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  isUrgent: boolean;
  dueDate: string;
}

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    content: '',
    priority: 'MEDIUM',
    category: '',
    isUrgent: false,
    dueDate: ''
  });
  
  // 첨부파일 관련 상태
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 삭제 확인 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);

  // 테스트용 사용자 초기화
  // initTestUser 제거 - 자동 로그인 비활성화

  // 첨부파일 상태 디버깅
  useEffect(() => {
    console.log('첨부파일 상태 변경:', attachments);
  }, [attachments]);

  // 문서 데이터 로드
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출
        if (!params?.id) {
          throw new Error('문서 ID가 없습니다.');
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api'}/documents/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('문서 수정용 데이터 로드:', result);
        
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
            isUrgent: apiDocument.isUrgent || false,
            documentNumber: apiDocument.documentNumber,
            version: apiDocument.version || 1,
            securityLevel: apiDocument.securityLevel || 'NORMAL',
            branchName: apiDocument.branchName || 'Unknown',
          };
          
          setDocument(document);
          setAttachments(document.attachments || []);
          
          // 첨부파일 로드
          await loadAttachments(document.id);
          
          // 폼 데이터 설정
          setFormData({
            title: document.title,
            content: document.content,
            priority: document.priority,
            category: document.documentType || document.category,
            isUrgent: document.isUrgent,
            dueDate: document.dueDate ? document.dueDate.split('T')[0] : ''
          });
        } else {
          throw new Error(result.message || '문서를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('문서 로드 실패:', error);
        toast({
          title: '오류',
          description: '문서를 불러오는데 실패했습니다.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadDocument();
    }
  }, [params?.id, toast]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof DocumentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !document || !user) return;

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: '파일 크기 초과',
        description: '파일 크기는 10MB를 초과할 수 없습니다.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploadingFile(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:8080/api/documents/${document.id}/attachments/upload`, {
        method: 'POST',
        headers: {
          'X-User-Id': user.id || 'ac31e829-d5c6-4a1d-92de-439178b12f5f'
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        toast({
          title: '파일 업로드 성공',
          description: `${file.name}이 성공적으로 업로드되었습니다.`,
          variant: 'success'
        });
        
        // 첨부파일 목록 새로고침
        await loadAttachments();
      } else {
        throw new Error(result.message || '파일 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('파일 업로드 오류:', error);
      toast({
        title: '파일 업로드 실패',
        description: error.message || '파일 업로드 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setUploadingFile(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 첨부파일 삭제 확인 모달 표시
  const handleDeleteAttachmentClick = (attachment: Attachment) => {
    setAttachmentToDelete(attachment);
    setShowDeleteConfirm(true);
  };

  // 첨부파일 삭제 실행
  const handleDeleteAttachment = async () => {
    if (!attachmentToDelete || !document || !user) return;

    try {
      setDeletingAttachmentId(attachmentToDelete.id);
      
      const response = await fetch(`http://localhost:8080/api/documents/attachments/${attachmentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': user.id || 'ac31e829-d5c6-4a1d-92de-439178b12f5f'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: '파일 삭제 성공',
          description: '첨부파일이 성공적으로 삭제되었습니다.',
          variant: 'success'
        });
        
        // 첨부파일 목록에서 제거
        setAttachments(prev => prev.filter(att => att.id !== attachmentToDelete.id));
      } else {
        throw new Error(result.message || '파일 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('파일 삭제 오류:', error);
      toast({
        title: '파일 삭제 실패',
        description: error.message || '파일 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setDeletingAttachmentId(null);
      setShowDeleteConfirm(false);
      setAttachmentToDelete(null);
    }
  };

  // 첨부파일 목록 로드
  const loadAttachments = async (documentId?: string) => {
    const docId = documentId || document?.id;
    if (!docId || !user) return;

    try {
      const response = await fetch(`http://localhost:8080/api/documents/${docId}/attachments`, {
        headers: {
          'X-User-Id': user.id || 'ac31e829-d5c6-4a1d-92de-439178b12f5f'
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        setAttachments(result.data);
        console.log('첨부파일 로드 성공:', result.data);
        console.log('첨부파일 개수:', result.data.length);
      } else {
        console.log('첨부파일 없음 또는 오류:', result);
      }
    } catch (error) {
      console.error('첨부파일 목록 로드 오류:', error);
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

  // 문서 수정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document || !user) {
      toast({
        title: '오류',
        description: '사용자 정보가 없습니다.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        documentType: formData.category,
        isUrgent: formData.isUrgent,
        dueDate: formData.dueDate ? `${formData.dueDate}T18:00:00Z` : null
      };

      console.log('문서 수정 요청 데이터:', updateData);

      if (!params?.id) {
        throw new Error('문서 ID가 없습니다.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api'}/documents/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id || 'ac31e829-d5c6-4a1d-92de-439178b12f5f'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      console.log('문서 수정 응답:', result);

      if (response.ok && result.success) {
        toast({
          title: '성공',
          description: '문서가 성공적으로 수정되었습니다.',
          variant: 'success'
        });
        
        // 문서 상세 페이지로 이동
        router.push(`/documents/${params.id}`);
      } else {
        throw new Error(result.message || '문서 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('문서 수정 실패:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '문서 수정에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/documents/${params?.id || ''}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                돌아가기
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">문서 수정</h1>
              <p className="text-muted-foreground">
                {document.documentNumber && `문서번호: ${document.documentNumber}`} • 
                버전: {document.version || 1}
              </p>
            </div>
          </div>
        </div>

        {/* 수정 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>문서 정보</CardTitle>
              <CardDescription>
                문서의 기본 정보를 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="문서 제목을 입력하세요"
                  required
                />
              </div>

              {/* 카테고리 */}
              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="계획서">계획서</SelectItem>
                    <SelectItem value="보고서">보고서</SelectItem>
                    <SelectItem value="제안서">제안서</SelectItem>
                    <SelectItem value="회의록">회의록</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 우선순위 */}
              <div className="space-y-2">
                <Label htmlFor="priority">우선순위</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="우선순위를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">낮음</SelectItem>
                    <SelectItem value="MEDIUM">보통</SelectItem>
                    <SelectItem value="HIGH">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 마감일 */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">마감일</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>

              {/* 긴급 여부 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isUrgent" className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>긴급 문서</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* 문서 내용 */}
          <Card>
            <CardHeader>
              <CardTitle>문서 내용</CardTitle>
              <CardDescription>
                문서의 상세 내용을 작성하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="문서 내용을 입력하세요"
                  className="min-h-[400px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 첨부파일 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                첨부파일
              </CardTitle>
              <CardDescription>
                문서와 관련된 파일을 첨부하세요. (최대 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 파일 업로드 */}
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {uploadingFile ? '업로드 중...' : '파일 추가'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    PDF, Word, Excel, PowerPoint, 이미지 파일 지원
                  </span>
                </div>

                {/* 첨부파일 목록 */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>첨부된 파일</Label>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {attachment.originalFilename}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(attachment.fileSize)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AttachmentDownloader 
                              attachment={attachment}
                              userId={user?.id}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttachmentClick(attachment)}
                              disabled={deletingAttachmentId === attachment.id}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {attachments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>첨부된 파일이 없습니다.</p>
                    <p className="text-sm">위의 '파일 추가' 버튼을 클릭하여 파일을 첨부하세요.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/documents/${params?.id || ''}`)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* 첨부파일 삭제 확인 모달 */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="첨부파일 삭제"
        itemName={attachmentToDelete?.originalFilename}
        onConfirm={handleDeleteAttachment}
        loading={deletingAttachmentId !== null}
      />
    </AppLayout>
  );
}
