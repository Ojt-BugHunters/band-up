'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { Highlight } from '@/components/ui/highlight';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { PointerHighlight } from '@/components/ui/pointer-highlight';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Brain,
    ChevronRight,
    GraduationCap,
    Layers,
    MessageSquare,
    Trophy,
    User,
    Video,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
                'group/feature relative flex flex-col py-10 lg:border-r dark:border-neutral-800',
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

const features = [
    {
        title: 'User Management',
        description:
            'Register, login, reset password, social login (Google/Facebook), profile page, and role-based access (Guest, Member, Premium, Admin).',
        icon: <User />,
    },
    {
        title: 'Blogs & Community',
        description:
            'Create, update, and explore blogs with genres and tags. Search, filter, comment, favorite, and report inappropriate content.',
        icon: <BookOpen />,
    },
    {
        title: 'Messaging & Social',
        description:
            'Connect with other learners via direct messaging, group discussions, and community interaction features.',
        icon: <MessageSquare />,
    },
    {
        title: 'Study Rooms',
        description:
            'Join or create study rooms with voice/video calls, Pomodoro timers, background music, and built-in translation and vocabulary tools.',
        icon: <Video />,
    },
    {
        title: 'IELTS Mock Tests',
        description:
            'Practice Reading, Listening, Speaking, and Writing. AI grading for Speaking & Writing, dictation mode, solo challenges, and vocabulary import.',
        icon: <GraduationCap />,
    },
    {
        title: 'Ranking & Progress',
        description:
            'Track learning progress with rankings by study hours, mock test scores, completed tests, and a leveling system.',
        icon: <Trophy />,
    },
    {
        title: 'Quizlet & Revision',
        description:
            'Create and share quizlet cards, study in multiple modes, auto-generate vocab from texts, and AI-powered practice questions.',
        icon: <Layers />,
    },
    {
        title: 'AI Learning Support',
        description:
            'Leverage AI for contextual translations, smart question generation, and personalized study recommendations.',
        icon: <Brain />,
    },
];

const BlogContent = () => {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black p-0">
            <Image
                src="/web-intro-blog.jpg"
                alt="Review Image"
                width={1000}
                height={500}
                className="h-full w-full rounded-xl object-cover object-center"
            />
        </div>
    );
};

const RoomContent = () => {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black p-0">
            <Image
                src="/web-intro-room.jpg"
                alt="Review Image"
                width="1000"
                height="500"
                className="h-full w-full rounded-xl object-cover object-center"
            />
        </div>
    );
};

const FlashCardContent = () => {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black p-0">
            <Image
                src="/web-intro-flashcard.jpg"
                alt="Review Image"
                width="1000"
                height="500"
                className="h-full w-full rounded-xl object-cover object-center"
            />
        </div>
    );
};

const TestContent = () => {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black p-0">
            <Image
                src="/hero-writing.jpg"
                alt="Review Image"
                width="1000"
                height="500"
                className="h-full w-full rounded-xl object-cover object-center"
            />
        </div>
    );
};

const tabs = [
    {
        title: 'Blog',
        value: 'Blog',
        content: (
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-xl font-bold text-white md:text-4xl">
                <BlogContent />
            </div>
        ),
    },
    {
        title: 'Room',
        value: 'Room',
        content: (
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-xl font-bold text-white md:text-4xl">
                <RoomContent />
            </div>
        ),
    },
    {
        title: 'Test',
        value: 'Test',
        content: (
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-xl font-bold text-white md:text-4xl">
                <TestContent />
            </div>
        ),
    },
    {
        title: 'FlashCard',
        value: 'FlashCard',
        content: (
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-xl font-bold text-white md:text-4xl">
                <FlashCardContent />
            </div>
        ),
    },
];

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
            <div className="relative mx-auto my-8 flex w-full max-w-5xl flex-col items-start justify-start [perspective:1000px] md:h-[40rem]">
                <Tabs tabs={tabs} />
            </div>
            <div className="relative z-10 mx-auto mt-20 grid max-w-7xl grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                    <Feature key={feature.title} {...feature} index={index} />
                ))}
            </div>
        </div>
    );
}
