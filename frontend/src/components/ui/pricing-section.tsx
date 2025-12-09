'use client';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { CheckCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import {
    useCreatePaymentLink,
    type SubscriptionType,
} from '@/lib/service/payment';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/service/account';

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
                'relative z-10 flex w-full rounded-full border border-gray-200 bg-white/70 p-1 shadow-inner backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70',
                className,
            )}
        >
            <button
                onClick={() => handleSwitch('0')}
                className={cn(
                    'relative z-10 h-12 w-full rounded-full px-3 py-1 font-medium transition-colors sm:px-6',
                    selected === '0'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
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
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
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

export default function PricingSection() {
    const [isUpdates, setIsUpdates] = useState(false);
    const createPaymentLink = useCreatePaymentLink();
    const router = useRouter();
    const user = useUser();

    const toggleUpdates = (value: string) =>
        setIsUpdates(Number.parseInt(value) === 1);

    const calculatePrice = () => {
        if (!isUpdates) return 98;
        return 200;
    };

    const calculateOriginalPrice = () => Math.round(calculatePrice() * 1.45);

    const currentPrice = calculatePrice();
    const originalPrice = calculateOriginalPrice();
    const subscriptionType: SubscriptionType = 'PREMIUM';

    const features = [
        'Unlimited using AI to writing test',
        'Unlimited using AI to speaking test',
        'Unlimited use of flashcard',
        'Unlimited dictation listening',
        'Step-by-step tutorial',
        'Access to full of test storage',
        'Friendly support',
    ];

    const handlePurchase = () => {
        if (!user) {
            toast.error('Please log in to purchase a subscription.');
            router.push('/auth/login');
            return;
        }

        createPaymentLink.mutate(
            {
                subscriptionType,
                isLifeTime: isUpdates,
            },
            {
                onSuccess: (data) => {
                    if (data?.checkoutUrl) {
                        window.location.href = data.checkoutUrl;
                    } else {
                        toast.error(
                            'Payment link missing checkout URL. Please try again.',
                        );
                    }
                },
            },
        );
    };

    return (
        <div className="relative mx-auto min-h-screen w-full bg-white px-4 pt-10 dark:bg-gray-950">
            <div className="relative mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-10 shadow-2xl dark:from-pink-950/40 dark:via-purple-950/40 dark:to-blue-950/40 dark:shadow-purple-900/20">
                <div className="absolute inset-0 rounded-3xl bg-white/30 backdrop-blur-sm dark:bg-gray-900/30" />

                <div className="relative text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-4 flex items-center justify-center"
                    >
                        <Zap className="mr-2 h-5 w-5 text-pink-500 dark:text-pink-400" />
                        <span className="font-medium text-pink-600 dark:text-pink-400">
                            Time to connect
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl md:text-5xl dark:from-white dark:via-purple-200 dark:to-white"
                    >
                        Let us get started
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-xl text-gray-700 dark:text-gray-300"
                    >
                        Dive into IELTS immediatly, save time and money. Profit!
                    </motion.p>
                </div>

                <div className="relative mt-10 grid items-center gap-8 sm:grid-cols-2">
                    <div>
                        <motion.h3
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white"
                        >
                            What is inside ?
                        </motion.h3>

                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.8 + index * 0.05,
                                    }}
                                    className="flex items-center"
                                >
                                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-md dark:from-pink-400 dark:to-purple-400 dark:shadow-purple-500/20">
                                        <CheckCheck className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {feature}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8 rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-purple-900/20">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                Access to updates
                            </h4>
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                One-time payment, updates come to the email
                            </p>
                            <PricingSwitch
                                button1="3 Months"
                                button2="Forever"
                                onSwitch={toggleUpdates}
                                className="grid w-full grid-cols-2"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                            className="grid grid-cols-2 items-center gap-2 px-2 text-center"
                        >
                            <div className="mb-4 flex items-center">
                                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-5xl font-semibold text-transparent dark:from-pink-400 dark:via-purple-400 dark:to-blue-400">
                                    $
                                    <NumberFlow
                                        value={currentPrice}
                                        className="text-5xl font-semibold"
                                    />
                                </span>
                                <span className="relative ml-2 text-xl text-gray-500 line-through dark:text-gray-400">
                                    $
                                    <NumberFlow
                                        value={originalPrice}
                                        className="text-xl font-semibold"
                                    />
                                </span>
                            </div>
                            <motion.button
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePurchase}
                                disabled={createPaymentLink.isPending}
                                className="h-12 w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-lg font-semibold text-white shadow-md transition-all hover:shadow-lg sm:h-16 dark:from-pink-600 dark:via-purple-600 dark:to-blue-600 dark:shadow-purple-500/30 dark:hover:shadow-purple-500/50"
                            >
                                {createPaymentLink.isPending
                                    ? 'Redirecting...'
                                    : 'Purchase'}
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
