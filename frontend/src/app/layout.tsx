import type { Metadata } from 'next';
import ClientLayout from './client-layout';
import QueryProvider from './query-provider';
import './globals.css';
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
            <ClientLayout>{children}</ClientLayout>
        </QueryProvider>
    );
}
