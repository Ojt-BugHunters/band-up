'use client';

import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import Link from 'next/link';

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    destructive: boolean;
    loading?: boolean;
    onConfirm?: () => void | Promise<void>;
    confirmHref?: string;
};
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive,
    loading,
    onConfirm,
    confirmHref,
}: ConfirmDialogProps) {
    const ActionBtn = (
        <AlertDialogAction
            disabled={loading}
            className={cn(
                destructive
                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
                    : '',
            )}
            onClick={confirmHref ? undefined : onConfirm}
        >
            {loading ? 'Processing...' : confirmText}
        </AlertDialogAction>
    );
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-slate-50">
                        {title}
                    </AlertDialogTitle>
                    {description ? (
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                            {description}
                        </AlertDialogDescription>
                    ) : null}
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {cancelText}
                    </AlertDialogCancel>

                    {confirmHref ? (
                        <Link href={confirmHref} passHref legacyBehavior>
                            <a>{ActionBtn}</a>
                        </Link>
                    ) : (
                        ActionBtn
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
