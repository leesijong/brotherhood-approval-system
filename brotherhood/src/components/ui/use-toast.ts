'use client';

import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

// 전역 상태 관리
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener([...toasts]));
};

export function useToast() {
  const [localToasts, setLocalToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setLocalToasts(newToasts);
    };
    
    toastListeners.push(listener);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastWithId: Toast = {
      id,
      duration: 5000,
      ...newToast,
    };

    toasts = [...toasts, toastWithId];
    notifyListeners();

    // Auto dismiss after duration
    if (toastWithId.duration && toastWithId.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, toastWithId.duration);
    }
  }, []);

  const dismiss = useCallback((toastId: string) => {
    toasts = toasts.filter((toast) => toast.id !== toastId);
    notifyListeners();
  }, []);

  return {
    toast,
    dismiss,
    toasts: localToasts,
  };
}
