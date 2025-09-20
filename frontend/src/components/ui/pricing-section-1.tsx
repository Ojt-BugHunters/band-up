'use client';
import { TimelineContent } from '@/components/ui/timeline-animation';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { CheckCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useId, useRef, useState } from 'react';

const PricingSwitch = ({
    button1,
    button2,
    onSwitch,
    className,
    layoutId,
}: {
    button1: string;
    button2: string;
    onSwitch: (value: string) => void;
    className?: string;
    layoutId?: string;
}) => {
    const [selected, setSelected] = useState('0');
    const uniqueId = useId();
    const switchLayoutId = layoutId || `switch-${uniqueId}`;

    const handleSwitch = (value: string) => {
        setSelected(value);
        onSwitch(value);
    };

    return (
        <div
            className={cn(
                'relative z-10 flex w-full rounded-full border border-gray-200 bg-white/70 p-1 shadow-inner backdrop-blur-sm',
                className,
            )}
        >
            <button
                onClick={() => handleSwitch('0')}
                className={cn(
                    'relative z-10 h-12 w-full rounded-full px-3 py-1 font-medium transition-colors sm:px-6',
                    selected === '0'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-900',
                )}
            >
                {selected === '0' && (
                    <motion.span
                        layoutId={switchLayoutId}
                        className="absolute top-0 left-0 h-12 w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg"
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                        }}
                    />
                )}
                <span className="relative">{button1}</span>
            </button>

            <button
                onClick={() => handleSwitch('1')}
                className={cn(
                    'relative z-10 h-12 w-full rounded-full px-3 py-1 font-medium transition-colors sm:px-6',
                    selected === '1'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-900',
                )}
            >
                {selected === '1' && (
                    <motion.span
                        layoutId={switchLayoutId}
                        className="absolute top-0 left-0 h-12 w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg"
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                        }}
                    />
                )}
                <span className="relative flex items-center justify-center gap-2">
                    {button2}
                </span>
            </button>
        </div>
    );
};

export default function PricingSection2() {
    const [isUpdates, setIsUpdates] = useState(false);
    const pricingRef = useRef<HTMLDivElement>(null);

    const revealVariants = {
        visible: (i: number) => ({
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: { delay: i * 0.2, duration: 0.5 },
        }),
        hidden: { filter: 'blur(10px)', y: -20, opacity: 0 },
    };

    const timelineVaraints = {
        visible: (i: number) => ({
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: { delay: i * 0.05, duration: 0.4 },
        }),
        hidden: { filter: 'blur(10px)', y: -20, opacity: 0 },
    };

    const toggleUpdates = (value: string) =>
        setIsUpdates(Number.parseInt(value) === 1);

    const calculatePrice = () => {
        if (!isUpdates) return 98;
        return 200;
    };

    const calculateOriginalPrice = () => Math.round(calculatePrice() * 1.45);

    const currentPrice = calculatePrice();
    const originalPrice = calculateOriginalPrice();

    const features = [
        'Unlimited using AI to writing test',
        'Unlimited using AI to speaking test',
        'Unlimited use of flashcard',
        'Unlimited dictation listening',
        'Step-by-step tutorial',
        'Access to full of test storage',
        'Friendly support',
    ];

    return (
        <div
            className="relative mx-auto min-h-screen w-full px-4 pt-10"
            ref={pricingRef}
        >
            <div className="relative mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-10 shadow-xl">
                <div className="absolute inset-0 rounded-3xl bg-white/30 backdrop-blur-sm" />

                <div className="relative text-center">
                    <TimelineContent
                        as="div"
                        animationNum={0}
                        timelineRef={pricingRef}
                        customVariants={revealVariants}
                        className="mb-4 flex items-center justify-center"
                    >
                        <Zap className="mr-2 h-5 w-5 text-pink-500" />
                        <span className="font-medium text-pink-600">
                            Time to connect
                        </span>
                    </TimelineContent>

                    <h1 className="mb-4 text-3xl font-semibold text-gray-900 sm:text-4xl md:text-5xl">
                        <VerticalCutReveal
                            splitBy="words"
                            staggerDuration={0.15}
                            staggerFrom="first"
                            reverse
                            containerClassName="justify-center"
                            transition={{
                                type: 'spring',
                                stiffness: 250,
                                damping: 40,
                                delay: 0.4,
                            }}
                        >
                            Let us get started
                        </VerticalCutReveal>
                    </h1>

                    <TimelineContent
                        as="p"
                        animationNum={1}
                        timelineRef={pricingRef}
                        customVariants={revealVariants}
                        className="text-xl text-gray-700"
                    >
                        Dive into IELTS immediatly, save time and money. Profit!
                    </TimelineContent>
                </div>

                <div className="relative mt-10 grid items-center gap-8 sm:grid-cols-2">
                    <div>
                        <TimelineContent
                            as="h3"
                            animationNum={2}
                            timelineRef={pricingRef}
                            customVariants={revealVariants}
                            className="mb-2 text-2xl font-semibold text-gray-900"
                        >
                            What is inside ?
                        </TimelineContent>

                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <TimelineContent
                                    key={index}
                                    as="div"
                                    animationNum={3 + index}
                                    timelineRef={pricingRef}
                                    customVariants={timelineVaraints}
                                    className="flex items-center"
                                >
                                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-md">
                                        <CheckCheck className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-gray-700">
                                        {feature}
                                    </span>
                                </TimelineContent>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8 rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-md">
                        <TimelineContent
                            as="div"
                            animationNum={3}
                            timelineRef={pricingRef}
                            customVariants={revealVariants}
                        >
                            <h4 className="mb-2 font-semibold text-gray-900">
                                Access to updates
                            </h4>
                            <p className="mb-2 text-sm text-gray-600">
                                One-time payment, updates come to the email
                            </p>
                            <PricingSwitch
                                button1="3 Months"
                                button2="Forever"
                                onSwitch={toggleUpdates}
                                className="grid w-full grid-cols-2"
                            />
                        </TimelineContent>

                        <TimelineContent
                            as="div"
                            animationNum={5}
                            timelineRef={pricingRef}
                            customVariants={revealVariants}
                            className="grid grid-cols-2 items-center gap-2 px-2 text-center"
                        >
                            <div className="mb-4 flex items-center">
                                <span className="text-5xl font-semibold text-gray-900">
                                    $
                                    <NumberFlow
                                        value={currentPrice}
                                        className="text-5xl font-semibold"
                                    />
                                </span>
                                <span className="relative ml-2 text-xl text-gray-500 line-through">
                                    $
                                    <NumberFlow
                                        value={originalPrice}
                                        className="text-xl font-semibold"
                                    />
                                </span>
                            </div>
                            <TimelineContent
                                as="button"
                                animationNum={6}
                                timelineRef={pricingRef}
                                customVariants={revealVariants}
                                className="h-12 w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-lg font-semibold text-white shadow-md transition-transform hover:scale-105 hover:shadow-lg sm:h-16"
                            >
                                Purchase
                            </TimelineContent>
                        </TimelineContent>
                    </div>
                </div>
            </div>
        </div>
    );
}
