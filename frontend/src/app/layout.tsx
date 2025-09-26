import type { Metadata } from 'next';
import ClientLayout from './client-layout';
import QueryProvider from './query-provider';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
    title: 'BandUp',
    description: 'BandUp Ielts Learning App',
};

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <body>
                <QueryProvider>
                    <ClientLayout>{children}</ClientLayout>
                </QueryProvider>
            </body>
        </html>
    );
}
