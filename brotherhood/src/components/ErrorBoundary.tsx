'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 리포팅 서비스로 전송 (예: Sentry, Bugsnag 등)
    // reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          showDetails={this.props.showDetails}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback 컴포넌트
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails?: boolean;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
  className?: string;
}

export function ErrorFallback({
  error,
  errorInfo,
  showDetails = false,
  onReset,
  onReload,
  onGoHome,
  className,
}: ErrorFallbackProps) {
  const [showFullDetails, setShowFullDetails] = React.useState(false);

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">문제가 발생했습니다</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            <p className="text-sm">
              문제가 계속 발생하면 관리자에게 문의해 주세요.
            </p>
          </div>

          {error && showDetails && (
            <div className="space-y-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="w-full"
              >
                <Bug className="h-4 w-4 mr-2" />
                {showFullDetails ? '에러 정보 숨기기' : '에러 정보 보기'}
              </Button>

              {showFullDetails && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">에러 메시지:</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                      {error.message}
                    </pre>
                  </div>

                  {error.stack && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">스택 트레이스:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">컴포넌트 스택:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onReset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
            <Button variant="outline" onClick={onReload} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              페이지 새로고침
            </Button>
            <Button variant="outline" onClick={onGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 특정 에러 타입별 처리
export function NetworkErrorFallback({
  onRetry,
  className,
}: {
  onRetry: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
        <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">네트워크 연결 문제</h3>
      <p className="text-muted-foreground mb-4">
        인터넷 연결을 확인하고 다시 시도해 주세요.
      </p>
      <Button onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        다시 시도
      </Button>
    </div>
  );
}

export function NotFoundErrorFallback({
  title = "페이지를 찾을 수 없습니다",
  description = "요청하신 페이지가 존재하지 않거나 삭제되었습니다.",
  onGoHome,
  className,
}: {
  title?: string;
  description?: string;
  onGoHome: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
        <AlertTriangle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button onClick={onGoHome}>
        <Home className="h-4 w-4 mr-2" />
        홈으로 돌아가기
      </Button>
    </div>
  );
}

// HOC for Error Boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// 에러 리포팅 유틸리티
export function reportError(error: Error, errorInfo?: ErrorInfo) {
  // 실제 프로덕션에서는 Sentry, Bugsnag 등의 서비스로 전송
  console.error('Error reported:', error, errorInfo);
  
  // 예시: 외부 서비스로 전송
  // Sentry.captureException(error, {
  //   contexts: {
  //     react: {
  //       componentStack: errorInfo?.componentStack,
  //     },
  //   },
  // });
}
