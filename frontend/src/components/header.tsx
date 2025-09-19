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
import Link from 'next/link';
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
                            src="/test.png"
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
                            src="/dictation.png"
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
                            src="/speaking.png"
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
                            src="/writing.png"
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
                            src="/flash-card.png"
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
                            src="/create.png"
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
                        <Link href="/auth/login">
                            <NavbarButton as="div" variant="secondary">
                                Login
                            </NavbarButton>
                        </Link>
                        <Link href={'/auth/register'}>
                            <NavbarButton as="div" variant="primary">
                                Sign Up
                            </NavbarButton>
                        </Link>
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
        </div>
    );
}
