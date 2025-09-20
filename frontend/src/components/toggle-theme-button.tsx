'use client';

import { motion } from 'framer-motion';
import { GripHorizontal, RefreshCcw } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

const Skiper4 = () => {
    const [scale, setScale] = useState(0);
    const [gap, setGap] = useState(0);
    const [flexDirection, setFlexDirection] = useState('row');

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-5">
            <motion.div
                className="relative flex items-center justify-center gap-1"
                animate={{
                    gap: gap ? `${gap}px` : '4px',
                    scale: scale ? `${scale / 20}` : '1',
                }}
                style={{
                    flexDirection:
                        flexDirection === 'column' ? 'column' : 'row',
                }}
                transition={{ duration: 0.35 }}
            >
                <motion.div layout>
                    <ThemeToggleButton className={cn('size-12')} />
                </motion.div>
            </motion.div>

            <Options
                scale={scale}
                setScale={setScale}
                gap={gap}
                setGap={setGap}
                setFlexDirection={setFlexDirection}
            />
        </div>
    );
};

export { Skiper4 };

type OptionsProps = {
    scale: number;
    setScale: (value: number) => void;
    gap: number;
    setGap: (value: number) => void;
    setFlexDirection: (value: string) => void;
};

const Options = ({
    scale,
    setScale,
    gap,
    setGap,
    setFlexDirection,
}: OptionsProps) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <motion.div
            className="border-foreground/10 bg-muted2 absolute top-30 right-1/2 flex w-[245px] translate-x-1/2 flex-col gap-3 rounded-3xl border p-3 backdrop-blur-sm lg:right-4 lg:translate-x-0"
            drag={isDragging}
            dragMomentum={false}
        >
            <div className="flex items-center justify-between">
                <span
                    onPointerDown={() => setIsDragging(true)}
                    onPointerUp={() => setIsDragging(false)}
                    className="size-4 cursor-grab active:cursor-grabbing"
                >
                    <GripHorizontal className="size-4 opacity-50" />
                </span>

                <p
                    onClick={() => {
                        setScale(0);
                        setGap(0);
                        setFlexDirection('row');
                    }}
                    className="hover:bg-foreground/10 group flex cursor-pointer items-center justify-center gap-2 rounded-lg px-2 py-1 text-sm opacity-50"
                >
                    Options
                    <span className="rotate-0 cursor-pointer transition-all duration-300 group-hover:rotate-90 group-active:-rotate-360">
                        <RefreshCcw className="size-4 opacity-50" />
                    </span>{' '}
                </p>
            </div>

            <div className="flex flex-col">
                <div className="flex items-center justify-between py-1">
                    <p className="text-sm opacity-50">Scale </p>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="bg-muted [&::-webkit-slider-runnable-track]:to-background [&::-webkit-slider-thumb]:bg-muted-foreground h-1.5 w-[150px] cursor-pointer appearance-none overflow-clip rounded-lg [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:bg-gradient-to-r [&::-moz-range-track]:from-blue-500 [&::-moz-range-track]:to-[#4F4F4E] [&::-moz-range-track]:bg-[length:var(--range-progress)_100%] [&::-moz-range-track]:bg-no-repeat [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-blue-500 [&::-webkit-slider-runnable-track]:bg-[length:var(--range-progress)_100%] [&::-webkit-slider-runnable-track]:bg-no-repeat [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                        style={
                            {
                                '--range-progress': `${scale}%`,
                            } as React.CSSProperties
                        }
                    />
                </div>
                <div className="flex items-center justify-between py-1">
                    <p className="text-sm opacity-50">Gap </p>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={gap}
                        onChange={(e) => setGap(Number(e.target.value))}
                        className="bg-muted [&::-webkit-slider-runnable-track]:to-background [&::-webkit-slider-thumb]:bg-muted-foreground h-1.5 w-[150px] cursor-pointer appearance-none overflow-clip rounded-lg [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:bg-gradient-to-r [&::-moz-range-track]:from-blue-500 [&::-moz-range-track]:to-[#4F4F4E] [&::-moz-range-track]:bg-[length:var(--range-progress)_100%] [&::-moz-range-track]:bg-no-repeat [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-blue-500 [&::-webkit-slider-runnable-track]:bg-[length:var(--range-progress)_100%] [&::-webkit-slider-runnable-track]:bg-no-repeat [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                        style={
                            {
                                '--range-progress': `${gap}%`,
                            } as React.CSSProperties
                        }
                    />
                </div>

                <div className="mt-1 flex items-center justify-between py-1">
                    <p className="text-sm opacity-50">Flex </p>
                    <div className="flex items-center justify-end gap-2">
                        <button
                            className="cursor-pointer text-sm opacity-50 hover:opacity-100"
                            onClick={() => setFlexDirection('column')}
                        >
                            coloumn
                        </button>
                        <button
                            className="cursor-pointer text-sm opacity-50 hover:opacity-100"
                            onClick={() => setFlexDirection('row')}
                        >
                            Row
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const ThemeToggleButton = ({
    className = '',
}: {
    className?: string;
}) => {
    const [isDark, setIsDark] = useState(false);
    return (
        <button
            type="button"
            className={cn(
                'rounded-full transition-all duration-300 active:scale-95',
                isDark ? 'bg-black text-white' : 'bg-white text-black',
                className,
            )}
            onClick={() => setIsDark(!isDark)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="currentColor"
                strokeLinecap="round"
                viewBox="0 0 32 32"
            >
                <clipPath id="skiper-btn-2">
                    <motion.path
                        animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
                        transition={{ ease: 'easeInOut', duration: 0.35 }}
                        d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
                    />
                </clipPath>
                <g clipPath="url(#skiper-btn-2)">
                    <motion.circle
                        animate={{ r: isDark ? 10 : 8 }}
                        transition={{ ease: 'easeInOut', duration: 0.35 }}
                        cx="16"
                        cy="16"
                    />
                    <motion.g
                        animate={{
                            rotate: isDark ? -100 : 0,
                            scale: isDark ? 0.5 : 1,
                            opacity: isDark ? 0 : 1,
                        }}
                        transition={{ ease: 'easeInOut', duration: 0.35 }}
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path d="M16 5.5v-4" />
                        <path d="M16 30.5v-4" />
                        <path d="M1.5 16h4" />
                        <path d="M26.5 16h4" />
                        <path d="m23.4 8.6 2.8-2.8" />
                        <path d="m5.7 26.3 2.9-2.9" />
                        <path d="m5.8 5.8 2.8 2.8" />
                        <path d="m23.4 23.4 2.9 2.9" />
                    </motion.g>
                </g>
            </svg>
        </button>
    );
};
