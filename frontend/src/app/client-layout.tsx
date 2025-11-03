'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from 'sonner';
import { useRefreshToken } from '@/hooks/use-refresh-token';
import { useEffect } from 'react';
import { initDeckAutoClear } from '@/lib/utils';

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
    const hideLayout =
        pathname.startsWith('/do') ||
        pathname.startsWith('/memorize') ||
        /^\/flashcard\/[^/]+\/test$/.test(pathname) ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/dictation/');
    useEffect(() => {
        initDeckAutoClear();
    }, []);
    return (
        <>
            <AutoRefeshToken />
            {!hideLayout && <Header />}
            {children}
            {!hideLayout && <Footer />}
            <Toaster richColors />
        </>
    );
}
