'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import { useRefreshToken } from '@/lib/service/auth';
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
        pathname.startsWith('/admin') ||
        pathname.startsWith('/dictation/') ||
        pathname.startsWith('/room') ||
        pathname.startsWith('/writing/') ||
        pathname.startsWith('/listening/') ||
        pathname.startsWith('/reading/') ||
        pathname.startsWith('/speaking/') ||
        pathname.includes('/reading/');

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
