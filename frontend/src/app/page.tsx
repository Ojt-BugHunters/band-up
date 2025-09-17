'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { Highlight } from '@/components/ui/highlight';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Image from 'next/image';
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
            <div className="mt-8 flex justify-center gap-4">
                <Button size="sm" className="rounded-full px-5 py-2 text-lg">
                    Get Started
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg px-5 py-2 text-lg"
                >
                    Take a Free Practice Test
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-col overflow-hidden">
                <ContainerScroll>
                    <Image
                        src="/hero-writing.jpg"
                        alt="hero"
                        height={720}
                        width={1400}
                        className="mx-auto h-full rounded-2xl object-cover object-left-top"
                        draggable={false}
                    />
                </ContainerScroll>
            </div>
        </div>
    );
}
