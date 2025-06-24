"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface LoadingBarProps {
  className?: string;
  height?: number;
  color?: string;
}

export function LoadingBar({ 
  className, 
  height = 3, 
  color = "bg-blue-500" 
}: LoadingBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setIsLoading(true);
    setProgress(0);

    const timer = setTimeout(() => {
      setProgress(30);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(70);
    }, 300);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 z-50 transition-all duration-300 ease-out",
        color,
        className
      )}
      style={{
        height: `${height}px`,
        width: `${progress}%`,
      }}
    />
  );
}

// Hook for manual loading control
export function useLoadingBar() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const start = React.useCallback(() => {
    setIsLoading(true);
    setProgress(0);
  }, []);

  const update = React.useCallback((value: number) => {
    setProgress(Math.min(Math.max(value, 0), 100));
  }, []);

  const finish = React.useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);
  }, []);

  return {
    isLoading,
    progress,
    start,
    update,
    finish,
  };
}