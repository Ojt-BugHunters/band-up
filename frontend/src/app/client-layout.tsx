'use client';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import { useRefreshToken } from '@/lib/service/auth';
import { useEffect } from 'react';
import { initDeckAutoClear } from '@/lib/utils-client';

function AutoRefeshToken() {
    useRefreshToken();
    return null;
}

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isFlashcardMemorizePage = /^\/flashcard\/[^/]+\/memorize/.test(
        pathname,
    );
    const hideLayout =
        pathname.includes('/do') ||
        pathname.includes('/writing-result') ||
        pathname.includes('/speaking-result') ||
        pathname.includes('/result') ||
        pathname.startsWith('/memorize') ||
        isFlashcardMemorizePage ||
        /^\/flashcard\/[^/]+\/test$/.test(pathname) ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/dictation/') ||
        pathname.startsWith('/room');

    useEffect(() => {
        initDeckAutoClear();
    }, []);

    return (
        <>
            <AutoRefeshToken />
            {!hideLayout && <Header />}
            {children}
            {!hideLayout && <Footer />}
            <Toaster />
        </>
    );
}
