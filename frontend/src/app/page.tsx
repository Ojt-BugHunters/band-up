'use client';
import { Badge } from '@/components/ui/badge';
import { Highlight } from '@/components/ui/highlight';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="mx-auto max-w-6xl pt-30 text-center">
            <div className="mb-8 flex justify-center">
                <Link href="/room">
                    <Badge
                        variant="secondary"
                        className="cursor-pointer px-4 py-1 text-sm font-medium"
                    >
                        Now available: Learning with your friends in Room
                        <ChevronRight className="h-4 w-4" />
                    </Badge>
                </Link>
            </div>
            <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
                <LayoutTextFlip
                    text="Your IELTS Journey Starts "
                    words={['here', 'Band Up IELTS', 'now']}
                />
            </motion.div>
            <p className="mx-auto mt-6 max-w-3xl text-2xl text-neutral-600 sm:text-xl dark:text-neutral-400">
                From practice tests to skill-building exercises, our platform
                empowers you to learn independently and progress
                <Highlight className="text-black dark:text-white">
                    step by step toward IELTS success.
                </Highlight>
            </p>
        </div>
    );
}
