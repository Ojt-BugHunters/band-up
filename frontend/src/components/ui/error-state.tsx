'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
    message?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    message = 'Something went wrong',
    description,
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center',
                'rounded-xl border border-red-500/20 bg-red-500/10 p-6 shadow-inner backdrop-blur-md',
                'transition-all duration-300 hover:bg-red-500/15',
                className,
            )}
        >
            <div className="mb-3 rounded-full bg-red-500/20 p-3 shadow-md">
                <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-400 drop-shadow-sm">
                {message}
            </h3>
            {description && (
                <p className="mt-1 text-sm text-red-300/80">{description}</p>
            )}
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 rounded-lg border border-red-400/40 px-4 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
