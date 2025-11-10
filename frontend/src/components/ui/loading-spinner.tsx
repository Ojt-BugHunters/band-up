'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({
    className,
    size = 'md',
}: LoadingSpinnerProps) {
    const sizeClasses =
        size === 'sm'
            ? 'h-5 w-5 border-2'
            : size === 'lg'
              ? 'h-12 w-12 border-[3px]'
              : 'h-8 w-8 border-2';

    return (
        <span
            className={cn(
                'inline-block animate-spin rounded-full border-white/20 border-t-cyan-400',
                'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
                sizeClasses,
                className,
            )}
        />
    );
}
