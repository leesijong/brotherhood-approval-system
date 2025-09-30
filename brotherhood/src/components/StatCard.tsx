'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-card text-card-foreground border-border',
  success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800',
  destructive: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
  info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800',
};

const iconStyles = {
  default: 'text-muted-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  destructive: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  loading = false,
  className,
  onClick,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.type) {
      case 'increase':
        return <TrendingUp className="h-3 w-3" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3" />;
      case 'neutral':
        return <Minus className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    
    switch (trend.type) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      case 'neutral':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-4 w-4 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-16 mb-2" />
          <div className="h-3 bg-muted rounded w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        onClick && "cursor-pointer hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", iconStyles[variant])} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {(description || trend) && (
          <div className="flex items-center space-x-2 mt-1">
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            
            {trend && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-1.5 py-0.5 flex items-center space-x-1",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              </Badge>
            )}
          </div>
        )}
        
        {trend?.label && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// 미리 정의된 통계 카드 컴포넌트들
export function DocumentStatCard({ 
  count, 
  trend, 
  loading = false 
}: { 
  count: number; 
  trend?: StatCardProps['trend']; 
  loading?: boolean; 
}) {
  return (
    <StatCard
      title="총 문서 수"
      value={count}
      description="전체 문서"
      trend={trend}
      loading={loading}
      variant="info"
    />
  );
}

export function ApprovalStatCard({ 
  pending, 
  completed, 
  trend, 
  loading = false 
}: { 
  pending: number; 
  completed: number; 
  trend?: StatCardProps['trend']; 
  loading?: boolean; 
}) {
  return (
    <StatCard
      title="결재 대기"
      value={pending}
      description={`완료: ${completed}`}
      trend={trend}
      loading={loading}
      variant="warning"
    />
  );
}

export function UserStatCard({ 
  total, 
  active, 
  trend, 
  loading = false 
}: { 
  total: number; 
  active: number; 
  trend?: StatCardProps['trend']; 
  loading?: boolean; 
}) {
  return (
    <StatCard
      title="사용자 수"
      value={total}
      description={`활성: ${active}`}
      trend={trend}
      loading={loading}
      variant="success"
    />
  );
}

export function RevenueStatCard({ 
  amount, 
  currency = 'KRW',
  trend, 
  loading = false 
}: { 
  amount: number; 
  currency?: string;
  trend?: StatCardProps['trend']; 
  loading?: boolean; 
}) {
  const formatCurrency = (value: number) => {
    if (currency === 'KRW') {
      return `₩${value.toLocaleString()}`;
    }
    return `${currency}${value.toLocaleString()}`;
  };

  return (
    <StatCard
      title="예산 사용률"
      value={formatCurrency(amount)}
      trend={trend}
      loading={loading}
      variant="default"
    />
  );
}
