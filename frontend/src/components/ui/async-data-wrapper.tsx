'use client';

import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AsyncDataWrapperProps<T> {
  /** Data to display */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Children to render when data is available */
  children: React.ReactNode | ((data: T) => React.ReactNode);
  /** Optional retry function */
  onRetry?: () => void;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  /** Check if data is empty (default checks array length or null) */
  isEmpty?: (data: T) => boolean;
  /** Minimum height for loading/error/empty states */
  minHeight?: string;
  /** Whether to show skeleton instead of spinner */
  skeleton?: React.ReactNode;
}

/**
 * Wrapper component for handling async data states (loading, error, empty, success)
 */
export function AsyncDataWrapper<T>({
  data,
  isLoading,
  error,
  children,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty,
  minHeight = '200px',
  skeleton,
}: AsyncDataWrapperProps<T>) {
  // Default empty check
  const checkEmpty = isEmpty ?? ((d: T) => {
    if (d === null || d === undefined) return true;
    if (Array.isArray(d)) return d.length === 0;
    if (typeof d === 'object') return Object.keys(d as object).length === 0;
    return false;
  });

  // Loading state
  if (isLoading) {
    if (skeleton) return <>{skeleton}</>;
    if (loadingComponent) return <>{loadingComponent}</>;
    
    return (
      <div 
        className="flex items-center justify-center" 
        style={{ minHeight }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    if (errorComponent) return <>{errorComponent}</>;
    
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-8" style={{ minHeight }}>
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            {error}
          </p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (data === null || checkEmpty(data)) {
    if (emptyComponent) return <>{emptyComponent}</>;
    
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8" style={{ minHeight }}>
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Success state - render children
  if (typeof children === 'function') {
    return <>{children(data)}</>;
  }
  
  return <>{children}</>;
}

/**
 * Skeleton loader component for lists
 */
export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-20 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader component for cards
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-32 bg-muted rounded-lg" />
    </div>
  );
}

/**
 * Skeleton loader for stats grid
 */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <Card className="p-4">
            <div className="h-4 bg-muted rounded w-20 mb-2" />
            <div className="h-8 bg-muted rounded w-16" />
          </Card>
        </div>
      ))}
    </div>
  );
}
