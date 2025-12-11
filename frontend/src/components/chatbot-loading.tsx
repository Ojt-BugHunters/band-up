'use client';

interface ChatbotLoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'compact';
}

export function ChatbotLoading({
    message = 'AI is thinking...',
    size = 'md',
    variant = 'default',
}: ChatbotLoadingProps) {
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
            className="h-full w-full"
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
                {/* Glow effect for cute appearance */}
                <filter id="cuteGlow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Head - big round circle with warm gradient */}
            <circle
                cx="50"
                cy="45"
                r="32"
                fill="url(#cuteGradient)"
                filter="url(#softShadow)"
                className="animate-float"
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

            {/* Left ear */}
            <circle
                cx="25"
                cy="25"
                r="8"
                fill="url(#cuteGradient)"
                opacity="0.9"
            />
            <circle cx="25" cy="25" r="5" fill="#ffc899" />

            {/* Right ear */}
            <circle
                cx="75"
                cy="25"
                r="8"
                fill="url(#cuteGradient)"
                opacity="0.9"
            />
            <circle cx="75" cy="25" r="5" fill="#ffc899" />

            {/* Left eye - big and expressive */}
            <g className="animate-pulse-eye">
                <circle cx="38" cy="42" r="8" fill="white" opacity="0.98" />
                <circle cx="39" cy="44" r="5" fill="#2d2d2d" />
                <circle cx="41" cy="41" r="2.5" fill="white" opacity="0.8" />
            </g>

            {/* Right eye - big and expressive */}
            <g
                className="animate-pulse-eye"
                style={{ animationDelay: '0.15s' }}
            >
                <circle cx="62" cy="42" r="8" fill="white" opacity="0.98" />
                <circle cx="61" cy="44" r="5" fill="#2d2d2d" />
                <circle cx="59" cy="41" r="2.5" fill="white" opacity="0.8" />
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

            {/* Cute rosy cheeks */}
            <circle cx="18" cy="50" r="6" fill="#ffb3b3" opacity="0.6" />
            <circle cx="82" cy="50" r="6" fill="#ffb3b3" opacity="0.6" />

            {/* Big happy smile - super cute */}
            <path
                d="M 42 58 Q 50 68 58 58"
                stroke="#2d2d2d"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                className="animate-pulse-mouth"
            />

            {/* Small nose */}
            <circle cx="50" cy="50" r="2.5" fill="#ff9e64" opacity="0.7" />
        </svg>
    );

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3">
                <div className="relative">
                    {/* Outer pulsing ring with warm colors */}
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#ff9e64] to-[#ffc899] opacity-20 blur-lg" />

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
                                className={`${dotSizeClasses[size]} animate-bounce rounded-full bg-gradient-to-r from-[#ff9e64] to-[#ffc899]`}
                                style={{ animationDelay: `${i * 0.1}s` }}
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
                {/* Outer glowing ring - warm colors */}
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#ff9e64] via-[#ffc899] to-[#ff9e64] opacity-30 blur-2xl" />
                <div
                    className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#ffc899] to-[#ff9e64] opacity-15 blur-xl"
                    style={{ animationDelay: '0.3s' }}
                />

                {/* Expanding rings with warm tones */}
                <div className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-[#ff9e64]/30" />
                <div
                    className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-[#ffc899]/20"
                    style={{ animationDelay: '0.3s' }}
                />

                {/* Bot container */}
                <div
                    className={`${sizeClasses[size]} relative flex items-center justify-center`}
                >
                    {renderBotCharacter()}
                </div>
            </div>

            {/* Message and loading dots */}
            <div className="space-y-3 text-center">
                <p
                    className={`text-foreground font-semibold ${textSizeClasses[size]}`}
                >
                    {message}
                </p>

                {/* Cute bouncing dots with warm gradient */}
                <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`${dotSizeClasses[size]} animate-bounce-wave rounded-full bg-gradient-to-r from-[#ff9e64] to-[#ffc899]`}
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ChatbotLoading;
