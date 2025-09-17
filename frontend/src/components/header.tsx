'use client';
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import Image from 'next/image';
import { useState } from 'react';

export function Header() {
    const navItems = [
        {
            name: 'Blogs',
            link: '/blogs',
        },
        {
            name: 'Room',
            link: '/room',
        },
        {
            name: 'Test',
            link: '#',
            submenu: (
                <div className="grid grid-cols-2 gap-6 p-4">
                    <a
                        href="/trial-test/storage"
                        className="flex items-start gap-3 rounded-md p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <Image
                            src="/band-up-logo.png"
                            alt="Storage"
                            width={30}
                            height={30}
                            className="h-10 w-10 rounded-md"
                        />
                        <div>
                            <p className="font-medium">Test Storage</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Practice with stored tests
                            </p>
                        </div>
                    </a>
                    <a
                        href="/trial-test/dictation"
                        className="flex items-start gap-3 rounded-md p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <Image
                            src="/band-up-logo.png"
                            alt="Dictation"
                            width={30}
                            height={30}
                            className="h-10 w-10 rounded-md"
                        />
                        <div>
                            <p className="font-medium">Dictation</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Improve your listening skills
                            </p>
                        </div>
                    </a>
                    <a
                        href="/trial-test/speaking-ai"
                        className="flex items-start gap-3 rounded-md p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <Image
                            src="/band-up-logo.png"
                            alt="Speaking"
                            width={30}
                            height={30}
                            className="h-10 w-10 rounded-md"
                        />
                        <div>
                            <p className="font-medium">Speaking with AI</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Talk with AI to practice speaking
                            </p>
                        </div>
                    </a>
                    <a
                        href="/trial-test/writing-ai"
                        className="flex items-start gap-3 rounded-md p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <Image
                            src="/band-up-logo.png"
                            alt="Writing"
                            width={30}
                            height={30}
                            className="h-10 w-10 rounded-md"
                        />
                        <div>
                            <p className="font-medium">Writing with AI</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                AI helps you write better
                            </p>
                        </div>
                    </a>
                </div>
            ),
        },
        {
            name: 'Flash Card',
            link: '#',
            submenu: (
                <div className="flex flex-col gap-2 p-4">
                    <a
                        href="/flashcard/learn"
                        className="flex items-start gap-3 rounded-md p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <Image
                            src="/band-up-logo.png"
                            alt="Learn"
                            width={30}
                            height={30}
                            className="h-10 w-10 rounded-md"
                        />
                        <div>
                            <p className="font-medium">Learn Flashcards</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Study from shared flashcards
                            </p>
                        </div>
                    </a>
                    <a
                        href="/flashcard/create"
                        className="flex items-start gap-3 rounded-md p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <Image
                            src="/band-up-logo.png"
                            alt="Create"
                            width={30}
                            height={30}
                            className="h-10 w-10 rounded-md"
                        />
                        <div>
                            <p className="font-medium">Create Flashcard</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Make your own flashcards
                            </p>
                        </div>
                    </a>
                </div>
            ),
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative w-full">
            <Navbar>
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4">
                        <NavbarButton variant="secondary">Login</NavbarButton>
                        <NavbarButton variant="primary">Sign Up</NavbarButton>
                    </div>
                </NavBody>

                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                            <a
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="block">{item.name}</span>
                            </a>
                        ))}
                        <div className="flex w-full flex-col gap-4">
                            <NavbarButton
                                onClick={() => setIsMobileMenuOpen(false)}
                                variant="primary"
                                className="w-full"
                            >
                                Login
                            </NavbarButton>
                            <NavbarButton
                                onClick={() => setIsMobileMenuOpen(false)}
                                variant="primary"
                                className="w-full"
                            >
                                Sign up
                            </NavbarButton>
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
            <DummyContent />
        </div>
    );
}

// Just a fake content to test navbar resizable when scroll. I will delete it when doing homepage
const DummyContent = () => {
    return (
        <div className="container mx-auto p-8 pt-24">
            <h1 className="mb-4 text-center text-3xl font-bold">
                Check the navbar at the top of the container
            </h1>
            <p className="mb-10 text-center text-sm text-zinc-500">
                For demo purpose we have kept the position as{' '}
                <span className="font-medium">Sticky</span>. Keep in mind that
                this component is <span className="font-medium">fixed</span> and
                will not move when scrolling.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[
                    {
                        id: 1,
                        title: 'The',
                        width: 'md:col-span-1',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 2,
                        title: 'First',
                        width: 'md:col-span-2',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 3,
                        title: 'Rule',
                        width: 'md:col-span-1',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 4,
                        title: 'Of',
                        width: 'md:col-span-3',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 5,
                        title: 'F',
                        width: 'md:col-span-1',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 6,
                        title: 'Club',
                        width: 'md:col-span-2',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 7,
                        title: 'Is',
                        width: 'md:col-span-2',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 8,
                        title: 'You',
                        width: 'md:col-span-1',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 9,
                        title: 'Do NOT TALK about',
                        width: 'md:col-span-2',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                    {
                        id: 10,
                        title: 'F Club',
                        width: 'md:col-span-1',
                        height: 'h-60',
                        bg: 'bg-neutral-100 dark:bg-neutral-800',
                    },
                ].map((box) => (
                    <div
                        key={box.id}
                        className={`${box.width} ${box.height} ${box.bg} flex items-center justify-center rounded-lg p-4 shadow-sm`}
                    >
                        <h2 className="text-xl font-medium">{box.title}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};
