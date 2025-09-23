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
                alt="Blog Image"
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
                alt="Room Image"
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
                alt="Flashcard Image"
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
                src="/web-intro-test.jpg"
                alt="Test Image"
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
        text: 'BandUp is the most exciting place for me to learn and practice IELTS.',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        name: 'Nam Dang',
        role: '9.0 IELTS',
    },
    {
        text: 'Thanks to BandUp, I boosted my IELTS Writing score from 6.0 to 7.5 in just 3 months.',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        name: 'Bilal Ahmed',
        role: '7.5 IELTS',
    },
    {
        text: 'The speaking practice partners here are amazing — I became much more confident before my IELTS test.',
        image: 'https://randomuser.me/api/portraits/women/3.jpg',
        name: 'Saman Malik',
        role: '7.0 IELTS',
    },
    {
        text: 'BandUp’s mock tests gave me the real exam feeling, which helped me achieve my dream band score.',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
        name: 'Omar Raza',
        role: '8.0 IELTS',
    },
    {
        text: 'I love how easy it is to find study partners and get feedback on my essays instantly.',
        image: 'https://randomuser.me/api/portraits/women/5.jpg',
        name: 'Zainab Hussain',
        role: '7.5 IELTS',
    },
    {
        text: 'BandUp has an incredible community. The daily practice kept me motivated until test day.',
        image: 'https://randomuser.me/api/portraits/women/6.jpg',
        name: 'Aliza Khan',
        role: '8.5 IELTS',
    },
    {
        text: 'Thanks to the app’s study planner, I managed my time better and improved all four IELTS skills.',
        image: 'https://randomuser.me/api/portraits/men/7.jpg',
        name: 'Farhan Siddiqui',
        role: '7.0 IELTS',
    },
    {
        text: 'The peer review system helped me refine my writing and spot mistakes I didn’t notice before.',
        image: 'https://randomuser.me/api/portraits/women/8.jpg',
        name: 'Sana Sheikh',
        role: '7.5 IELTS',
    },
    {
        text: 'With BandUp, my Listening improved drastically. I went from 6.0 to 8.0 in just a few weeks.',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        name: 'Hassan Ali',
        role: '8.0 IELTS',
    },
];
