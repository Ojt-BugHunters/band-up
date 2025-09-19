import {
    BookOpen,
    Brain,
    GraduationCap,
    Layers,
    MessageSquare,
    Trophy,
    User,
    Video,
} from 'lucide-react';
import Image from 'next/image';

export const features = [
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

export const tabs = [
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

export const testimonials = [
    {
        quote: "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
        name: 'Sarah Chen',
        designation: 'Product Manager at TechFlow',
        src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        quote: "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
        name: 'Michael Rodriguez',
        designation: 'CTO at InnovateSphere',
        src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        quote: "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
        name: 'Emily Watson',
        designation: 'Operations Director at CloudScale',
        src: 'https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        quote: "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
        name: 'James Kim',
        designation: 'Engineering Lead at DataPro',
        src: 'https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        quote: 'The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.',
        name: 'Lisa Thompson',
        designation: 'VP of Technology at FutureNet',
        src: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
];
