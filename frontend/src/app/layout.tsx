import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import QueryProvider from './query-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    title: 'BandUp',
    description: 'BandUp Ielts Learning App',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <ClientLayout>
                <Header />
                {children}
                <Footer />
                <Toaster richColors />
            </ClientLayout>
        </QueryProvider>
    );
}
