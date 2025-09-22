import { cn } from '@/lib/utils';
import { JSX, PropsWithChildren } from 'react';

export const StatsIcon = ({
    children,
    className,
    ...props
}: PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    return (
        <div
            className={cn(
                className,
                'mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const StatsLabel = ({
    children,
    className,
    ...props
}: PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    return (
        <div
            className={cn(
                className,
                'mb-1 text-sm font-semibold text-slate-900',
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const StatsDescription = ({
    children,
    className,
    ...props
}: PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    return (
        <div className={cn(className, 'text-xs text-slate-500')} {...props}>
            {children}
        </div>
    );
};

export const StatsValue = ({
    children,
    className,
    ...props
}: PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    return (
        <div
            className={cn(className, 'mb-2 text-3xl font-bold text-slate-900')}
            {...props}
        >
            {children}
        </div>
    );
};

export const Stats = ({
    children,
    className,
    ...props
}: PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    return (
        <div
            className={cn(
                className,
                'mx-auto w-full rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50',
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const StatsGrid = ({ children }: PropsWithChildren) => {
    return (
        <section className="border-t border-slate-100 bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {children}
                </div>
            </div>
        </section>
    );
};
