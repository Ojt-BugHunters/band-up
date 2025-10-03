import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

const colorMap = {
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
} as const;

export const HeroSummary = ({
    color,
    children,
}: PropsWithChildren<{ color: keyof typeof colorMap }>) => {
    return (
        <div
            className={cn(
                'mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium',
                colorMap[color],
            )}
        >
            {children}
        </div>
    );
};

export const HeroKeyword = ({
    color,
    children,
}: PropsWithChildren<{ color: string }>) => {
    return (
        <span className={`block text-${color}-600 dark:text-${color}-400`}>
            {children}
        </span>
    );
};

export const HeroTitle = ({ children }: PropsWithChildren) => {
    return (
        <h1 className="mb-6 text-5xl leading-tight font-bold text-slate-900 md:text-6xl dark:text-white">
            {children}
        </h1>
    );
};

export const HeroDescription = ({ children }: PropsWithChildren) => {
    return (
        <p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-400">
            {children}
        </p>
    );
};

export const Hero = ({ children }: PropsWithChildren) => {
    return (
        <section className="bg-white dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">{children}</div>
            </div>
        </section>
    );
};
