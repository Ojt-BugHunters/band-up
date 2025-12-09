'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { Highlight } from '@/components/ui/highlight';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { PointerHighlight } from '@/components/ui/pointer-highlight';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { features, testimonials } from './page.data';
import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1';
import PricingSection from '@/components/ui/pricing-section';
import { Timeline } from '@/components/ui/timeline';

const Feature = ({
    title,
    description,
    icon,
    index,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}) => {
    return (
        <div
            className={cn(
                'group/feature relative flex flex-col py-8 lg:border-r dark:border-neutral-800',
                (index === 0 || index === 4) &&
                    'lg:border-l dark:border-neutral-800',
                index < 4 && 'lg:border-b dark:border-neutral-800',
            )}
        >
            {index < 4 && (
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800" />
            )}
            {index >= 4 && (
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800" />
            )}
            <div className="relative z-10 mb-4 px-10 text-neutral-600 dark:text-neutral-400">
                {icon}
            </div>
            <div className="relative z-10 mb-2 px-10 text-lg font-bold">
                <div className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-tr-full rounded-br-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-blue-500 dark:bg-neutral-700" />
                <span className="inline-block text-neutral-800 transition duration-200 group-hover/feature:translate-x-2 dark:text-neutral-100">
                    {title}
                </span>
            </div>
            <p className="relative z-10 max-w-xs px-10 text-sm text-neutral-600 dark:text-neutral-300">
                {description}
            </p>
        </div>
    );
};

export default function HomePage() {
    const firstColumn = testimonials.slice(0, 3);
    const secondColumn = testimonials.slice(3, 6);
    const thirdColumn = testimonials.slice(6, 9);
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
                <Link href="/auth/login">
                    <Button
                        size="sm"
                        className="rounded-lg p-4 px-5 py-2 text-lg"
                    >
                        Get Started
                    </Button>
                </Link>
                <Link href="/test">
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg p-4 text-lg"
                    >
                        Take a Free Practice Test
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
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
            <div className="mt-20 text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                    A web app tool with
                    <PointerHighlight
                        rectangleClassName="bg-blue-400 dark:bg-rose-700 border-neutral-300 dark:border-neutral-600 leading-loose"
                        pointerClassName="text-yellow-500 h-3 w-3"
                        containerClassName="inline-block ml-1"
                    >
                        <span className="relative z-10">
                            everything you need
                        </span>
                    </PointerHighlight>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                    From learning with your friends, IELTS Trial Test, Speaking
                    and Writing automation feedback to Ranking, Flashcards. Try
                    us out on this site!
                </p>
            </div>
            <div className="relative w-full overflow-clip">
                <Timeline />
            </div>
            <div className="relative z-10 mx-auto mt-20 grid max-w-7xl grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                    <Feature key={feature.title} {...feature} index={index} />
                ))}
            </div>
            <div className="mt-20 text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                    Love from all over the universe
                </h2>
                <p className="mx-auto mt-4 max-w-4xl text-lg text-neutral-600 dark:text-neutral-400">
                    BandUp IELTS has just released, and we are sure future
                    <Highlight className="bg-rose-400 text-black dark:text-white">
                        feedback will be just as amazing as
                    </Highlight>
                    the placeholders below!
                </p>
            </div>
            <section className="bg-background relative my-20">
                <div className="z-10 container mx-auto">
                    <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
                        <TestimonialsColumn
                            testimonials={firstColumn}
                            duration={15}
                        />
                        <TestimonialsColumn
                            testimonials={secondColumn}
                            className="hidden md:block"
                            duration={19}
                        />
                        <TestimonialsColumn
                            testimonials={thirdColumn}
                            className="hidden lg:block"
                            duration={17}
                        />
                    </div>
                </div>
            </section>
            <PricingSection />
        </div>
    );
}
