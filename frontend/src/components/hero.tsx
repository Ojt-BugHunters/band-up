import { PropsWithChildren } from 'react';

export const HeroKeyword = ({
    color,
    children,
}: PropsWithChildren<{ color: string }>) => {
    return <span className={`block text-${color}-600`}>{children}</span>;
};

export const HeroTitle = ({ children }: PropsWithChildren) => {
    return (
        <h1 className="mb-6 text-5xl leading-tight font-bold text-slate-900 md:text-6xl">
            {children}
        </h1>
    );
};

export const HeroDescription = ({ children }: PropsWithChildren) => {
    return (
        <p className="mb-8 text-xl leading-relaxed text-slate-600">
            {children}
        </p>
    );
};

export const Hero = ({ children }: PropsWithChildren) => {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">{children}</div>
            </div>
        </section>
    );
};
