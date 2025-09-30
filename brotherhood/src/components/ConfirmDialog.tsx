'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmVariant: 'default' as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    confirmVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    confirmVariant: 'default' as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
    confirmVariant: 'default' as const,
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmVariant: 'default' as const,
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
  className,
}: ConfirmDialogProps) {
  const { icon: Icon, iconColor, confirmVariant } = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-muted">
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <DialogTitle className="text-left">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-left pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                처리 중...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 특정 용도의 확인 다이얼로그들
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = '삭제 확인',
  description,
  itemName,
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description || `${itemName ? `"${itemName}"을(를) ` : ''}정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      confirmText="삭제"
      cancelText="취소"
      variant="destructive"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

export function SaveConfirmDialog({
  open,
  onOpenChange,
  title = '저장 확인',
  description = '변경사항을 저장하시겠습니까?',
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText="저장"
      cancelText="취소"
      variant="default"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="로그아웃"
      description="정말 로그아웃하시겠습니까?"
      confirmText="로그아웃"
      cancelText="취소"
      variant="warning"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  title = '제출 확인',
  description = '문서를 제출하시겠습니까? 제출 후에는 수정이 제한됩니다.',
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText="제출"
      cancelText="취소"
      variant="success"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

// 커스텀 확인 다이얼로그 훅
export function useConfirmDialog() {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'> | null>(null);

  const confirm = React.useCallback((
    title: string,
    onConfirm: () => void,
    options?: Partial<Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'title' | 'onConfirm'>>
  ) => {
    setConfig({
      title,
      onConfirm: () => {
        onConfirm();
        setOpen(false);
      },
      ...options,
    });
    setOpen(true);
  }, []);

  const ConfirmDialogComponent = React.useMemo(() => {
    if (!config) return null;

    return (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        {...config}
      />
    );
  }, [open, config]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
