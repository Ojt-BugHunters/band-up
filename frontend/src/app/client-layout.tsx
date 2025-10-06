'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from 'sonner';
import { useRefreshToken } from '@/hooks/use-refresh-token';

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
    const hideLayout = ['/do', '/memorize'].some((path) =>
        pathname.includes(path),
    );
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
