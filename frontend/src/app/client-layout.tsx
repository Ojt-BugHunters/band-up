'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from 'sonner';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const hideLayout = pathname.includes('/do');
    return (
        <>
            {!hideLayout && <Header />}
            {children}
            {!hideLayout && <Footer />}
            <Toaster richColors />
        </>
    );
}
