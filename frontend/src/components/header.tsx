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
import { useUser } from '@/hooks/use-user';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AccountPicture } from './ui/account-picture';
import { ChevronDown, History, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountOverview } from './account-overview';
import { useLogout } from '@/hooks/use-logout';

export function Header() {
    const user = useUser();
    const isMember = user?.role === 'Member';
    const logout = useLogout();

    const navItems = [
        {
            name: 'Blogs',
            link: '/blog',
        },
        {
            name: 'Room',
            link: '/room',
        },
        {
            name: 'Test',
            link: '/test',
            submenu: (
                <div className="grid grid-cols-2 gap-6 p-4">
                    <Link
                        href="/test"
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
                    </Link>
                    <Link
                        href="/dictation"
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
                    </Link>
                    <Link
                        href="/test"
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
                    </Link>
                    <Link
                        href="/test"
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
                    </Link>
                </div>
            ),
        },
        {
            name: 'Flash Card',
            link: '#',
            submenu: (
                <div className="flex flex-col gap-2 p-4">
                    <Link
                        href="/flashcard"
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
                    </Link>
                    <Link
                        href="/flashcard/new"
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
                    </Link>
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
                    {!isMember ? (
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
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200">
                                    <div className="size-8">
                                        <AccountPicture name={user.name} />
                                    </div>
                                    <ChevronDown className="h-3 w-3 text-slate-500 transition-colors duration-200 group-hover:text-slate-700" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={cn(
                                    'mt-2 rounded-2xl border p-2 shadow-xl transition-all duration-300',
                                )}
                            >
                                <div className="mb-2 border-b border-slate-100 px-3 py-3">
                                    <AccountOverview user={user} />
                                </div>
                                {isMember && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/account"
                                                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-slate-50"
                                            >
                                                <div className="rounded-lg bg-blue-50 p-1.5">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-900">
                                                        Profile
                                                    </span>
                                                    <div className="text-xs text-slate-500">
                                                        Manage your account
                                                    </div>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/history"
                                                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-slate-50"
                                            >
                                                <div className="rounded-lg bg-green-50 p-1.5">
                                                    <History className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-900">
                                                        Hisotry
                                                    </span>
                                                    <div className="text-xs text-slate-500">
                                                        Manage your test history
                                                    </div>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem
                                    onClick={() => logout.mutate()}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-red-600 transition-colors duration-200 hover:bg-red-50 focus:text-red-600"
                                >
                                    <div className="rounded-lg bg-red-50 p-1.5">
                                        <LogOut className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            Logout
                                        </span>
                                        <div className="text-xs text-red-500">
                                            Sign out of your account
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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
                        {!isMember ? (
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
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200">
                                        <div className="size-8">
                                            <AccountPicture name={user.name} />
                                        </div>
                                        <ChevronDown className="h-3 w-3 text-slate-500 transition-colors duration-200 group-hover:text-slate-700" />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className={cn(
                                        'mt-2 rounded-2xl border p-2 shadow-xl transition-all duration-300',
                                    )}
                                >
                                    <div className="mb-2 border-b border-slate-100 px-3 py-3">
                                        <AccountOverview user={user} />
                                    </div>
                                    {isMember && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/account"
                                                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-slate-50"
                                                >
                                                    <div className="rounded-lg bg-blue-50 p-1.5">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-900">
                                                            Profile
                                                        </span>
                                                        <div className="text-xs text-slate-500">
                                                            Manage your account
                                                        </div>
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        //onClick={() => logout.mutate()}
                                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-red-600 transition-colors duration-200 hover:bg-red-50 focus:text-red-600"
                                    >
                                        <div className="rounded-lg bg-red-50 p-1.5">
                                            <LogOut className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Logout
                                            </span>
                                            <div className="text-xs text-red-500">
                                                Sign out of your account
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}
