'use client';

import type React from 'react';

import { useEffect, useState } from 'react';

interface ChatbotLoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'compact';
}

function Particle({ delay, index }: { delay: number; index: number }) {
    const xOffset = (index % 2 === 0 ? 1 : -1) * (Math.random() * 20 + 10);

    return (
        <div
            className="animate-particle-float absolute"
            style={
                {
                    animationDelay: `${delay}s`,
                    left: '50%',
                    top: '50%',
                    '--particle-x': `${xOffset}px`,
                } as React.CSSProperties
            }
        >
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 blur-[1px]" />
        </div>
    );
}

function Sparkle({
    delay,
    position,
}: {
    delay: number;
    position: { x: number; y: number };
}) {
    return (
        <div
            className="animate-sparkle absolute"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                animationDelay: `${delay}s`,
            }}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                    d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
                    fill="url(#sparkleGradient)"
                />
                <defs>
                    <linearGradient id="sparkleGradient">
                        <stop offset="0%" stopColor="#ffd89b" />
                        <stop offset="100%" stopColor="#ff9e64" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

export function ChatbotLoading({
    message = 'AI is thinking...',
    size = 'md',
    variant = 'default',
}: ChatbotLoadingProps) {
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 3000);

        return () => clearInterval(blinkInterval);
    }, []);

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-20 h-20',
        lg: 'w-32 h-32',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const dotSizeClasses = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    const renderBotCharacter = () => (
        <svg
            className="animate-glow-pulse h-full w-full"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Warm gradient - peach to soft coral */}
                <radialGradient id="cuteGradient" cx="50%" cy="35%">
                    <stop offset="0%" stopColor="#ffd89b" stopOpacity="1" />
                    <stop
                        offset="100%"
                        stopColor="#ff9e64"
                        stopOpacity="0.95"
                    />
                </radialGradient>
                <filter
                    id="softShadow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                >
                    <feDropShadow
                        dx="0"
                        dy="3"
                        stdDeviation="2"
                        floodOpacity="0.2"
                    />
                </filter>
            </defs>

            <g className="animate-float-rotate origin-center">
                <g className="animate-breathe origin-center">
                    {/* Head - big round circle with warm gradient */}
                    <circle
                        cx="50"
                        cy="45"
                        r="32"
                        fill="url(#cuteGradient)"
                        filter="url(#softShadow)"
                    />

                    {/* Shine highlight for cuteness */}
                    <ellipse
                        cx="38"
                        cy="28"
                        rx="14"
                        ry="12"
                        fill="white"
                        opacity="0.35"
                    />

                    {/* Left ear with bounce */}
                    <g className="origin-center animate-pulse">
                        <circle
                            cx="25"
                            cy="25"
                            r="8"
                            fill="url(#cuteGradient)"
                            opacity="0.9"
                        />
                        <circle cx="25" cy="25" r="5" fill="#ffc899" />
                    </g>

                    {/* Right ear with bounce */}
                    <g
                        className="origin-center animate-pulse"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <circle
                            cx="75"
                            cy="25"
                            r="8"
                            fill="url(#cuteGradient)"
                            opacity="0.9"
                        />
                        <circle cx="75" cy="25" r="5" fill="#ffc899" />
                    </g>

                    {/* Left eye - big and expressive */}
                    <g>
                        <circle
                            cx="38"
                            cy="42"
                            r="8"
                            fill="white"
                            opacity="0.98"
                        />
                        <circle cx="39" cy="44" r="5" fill="#2d2d2d" />
                        <circle
                            cx="41"
                            cy="41"
                            r="2.5"
                            fill="white"
                            opacity="0.8"
                        />
                        {/* Eyelid for blink effect */}
                        {isBlinking && (
                            <ellipse
                                cx="38"
                                cy="42"
                                rx="8"
                                ry="8"
                                fill="url(#cuteGradient)"
                            />
                        )}
                    </g>

                    {/* Right eye - big and expressive */}
                    <g>
                        <circle
                            cx="62"
                            cy="42"
                            r="8"
                            fill="white"
                            opacity="0.98"
                        />
                        <circle cx="61" cy="44" r="5" fill="#2d2d2d" />
                        <circle
                            cx="59"
                            cy="41"
                            r="2.5"
                            fill="white"
                            opacity="0.8"
                        />
                        {/* Eyelid for blink effect */}
                        {isBlinking && (
                            <ellipse
                                cx="62"
                                cy="42"
                                rx="8"
                                ry="8"
                                fill="url(#cuteGradient)"
                            />
                        )}
                    </g>

                    {/* Happy eyebrows - curved and expressive */}
                    <path
                        d="M 30 37 Q 38 35 46 37"
                        stroke="#ff9e64"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 54 37 Q 62 35 70 37"
                        stroke="#ff9e64"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />

                    <circle
                        cx="18"
                        cy="50"
                        r="6"
                        fill="#ffb3b3"
                        opacity="0.6"
                        className="animate-pulse"
                    />
                    <circle
                        cx="82"
                        cy="50"
                        r="6"
                        fill="#ffb3b3"
                        opacity="0.6"
                        className="animate-pulse"
                        style={{ animationDelay: '0.3s' }}
                    />

                    {/* Big happy smile - super cute */}
                    <path
                        d="M 42 58 Q 50 68 58 58"
                        stroke="#2d2d2d"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Small nose */}
                    <circle
                        cx="50"
                        cy="50"
                        r="2.5"
                        fill="#ff9e64"
                        opacity="0.7"
                    />
                </g>
            </g>
        </svg>
    );

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#ff9e64] to-[#ffc899] opacity-20 blur-lg" />
                    <div
                        className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#ffc899] to-[#ff9e64] opacity-15 blur-xl"
                        style={{ animationDelay: '0.5s' }}
                    />

                    {/* Bot container */}
                    <div
                        className={`${sizeClasses[size]} relative flex items-center justify-center`}
                    >
                        {renderBotCharacter()}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <p
                        className={`font-semibold ${textSizeClasses[size]} text-foreground`}
                    >
                        {message}
                    </p>
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`${dotSizeClasses[size]} animate-wave-bounce rounded-full bg-gradient-to-r from-[#ff9e64] to-[#ffc899] shadow-lg`}
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            {/* Main bot container with warm glow effect */}
            <div className="relative">
                {/* Outer glowing rings - warm colors with shimmer */}
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#ff9e64] via-[#ffc899] to-[#ff9e64] opacity-30 blur-2xl" />
                <div
                    className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#ffc899] to-[#ff9e64] opacity-15 blur-xl"
                    style={{ animationDelay: '0.3s' }}
                />

                <div className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-[#ff9e64]/30" />
                <div
                    className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-[#ffc899]/20"
                    style={{ animationDelay: '1s' }}
                />

                {[...Array(6)].map((_, i) => (
                    <Particle key={i} delay={i * 0.5} index={i} />
                ))}

                <Sparkle delay={0} position={{ x: 10, y: 20 }} />
                <Sparkle delay={0.7} position={{ x: 85, y: 30 }} />
                <Sparkle delay={1.4} position={{ x: 15, y: 75 }} />
                <Sparkle delay={2.1} position={{ x: 90, y: 80 }} />

                {/* Bot container */}
                <div
                    className={`${sizeClasses[size]} relative flex items-center justify-center`}
                >
                    {renderBotCharacter()}
                </div>
            </div>

            {/* Message and loading dots */}
            <div className="space-y-3 text-center">
                <div className="relative inline-block overflow-hidden">
                    <p
                        className={`text-foreground font-semibold ${textSizeClasses[size]}`}
                    >
                        {message}
                    </p>
                    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`${dotSizeClasses[size]} animate-wave-bounce rounded-full bg-gradient-to-r from-[#ff9e64] to-[#ffc899] shadow-lg shadow-orange-300/50`}
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ChatbotLoading;
